import Guide from "../models/Guide.model.js";
import VerifiedGuide from "../models/VerifiedGuide.model.js";
import VerificationAttempt from "../models/VerificationAttempt.model.js";
import {
  extractTextWithOcr,
  persistUploadedFile,
} from "../services/verification.service.js";
import {
  nameSimilarity,
  normalizeEnrollment,
  normalizeName,
  parseEnrollmentNumber,
  parseFullName,
} from "../utils/verification.utils.js";

const LOW_CONFIDENCE_THRESHOLD = 0.7;
const NAME_STRONG_THRESHOLD = 0.9;
const NAME_WEAK_THRESHOLD = 0.75;
const DEFAULT_IITF_EXAM_URL = "https://iitf.gov.in/login/index.php";

function sanitizeOcrText(value = "") {
  return value
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/\r/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export const getVerificationStatus = async (req, res) => {
  try {
    const guide = await Guide.findOne({ user_id: req.user.uid });

    if (!guide) {
      return res.json({
        success: true,
        guide: {
          is_verified: false,
          verification_status: "not_submitted",
          availability: false,
        },
      });
    }

    return res.json({
      success: true,
      guide,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const uploadVerificationCertificate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a certificate image or PDF",
      });
    }

    const declaredFullName = (req.body?.declared_full_name || "").trim();

    const guide = await Guide.findOneAndUpdate(
      { user_id: req.user.uid },
      {
        $setOnInsert: {
          user_id: req.user.uid,
          name: req.user.name || "Local Guide",
          full_name: declaredFullName || req.user.name || "",
        },
        verification_status: "processing",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const persisted = await persistUploadedFile(req.file);
    const ocr = await extractTextWithOcr(req.file, persisted.absolutePath);
    const cleanText = sanitizeOcrText(ocr.text);

    const extractedEnrollment = normalizeEnrollment(parseEnrollmentNumber(cleanText));
    const extractedName = parseFullName(cleanText) || guide.full_name || guide.name || "";
    const normalizedExtractedName = normalizeName(extractedName);
    const accountName = normalizeName(
      declaredFullName || guide.full_name || guide.name || req.user.name || ""
    );

    let decision = "not_matched";
    let verificationStatus = "rejected";
    let isVerified = false;
    let verificationMessage = "Certificate not recognized";

    let govRecord = null;
    if (extractedEnrollment) {
      govRecord = await VerifiedGuide.findOne({ enrollment_no: extractedEnrollment });

      if (!govRecord) {
        const candidates = await VerifiedGuide.find({ status: "active" }).lean();
        govRecord = candidates.find(
          (record) => normalizeEnrollment(record.enrollment_no) === extractedEnrollment
        ) || null;
      }
    }

    if (govRecord && govRecord.status === "active") {
      const ocrNameSimilarity = nameSimilarity(govRecord.normalized_name, normalizedExtractedName);
      const accountNameSimilarity = nameSimilarity(govRecord.normalized_name, accountName);

      if (accountNameSimilarity < NAME_STRONG_THRESHOLD) {
        decision = "not_matched";
        verificationStatus = "rejected";
        verificationMessage = "Certificate name does not match your account name.";
      } else if (
        ocrNameSimilarity >= NAME_STRONG_THRESHOLD ||
        govRecord.normalized_name === normalizedExtractedName ||
        ocr.confidence < LOW_CONFIDENCE_THRESHOLD
      ) {
        decision = "matched";
        verificationStatus = "verified";
        isVerified = true;
        verificationMessage = "IITF certificate verified successfully.";
      } else if (ocrNameSimilarity >= NAME_WEAK_THRESHOLD) {
        decision = "low_confidence";
        verificationStatus = "processing";
        verificationMessage = "Name was partially recognized. Please upload a clearer certificate.";
      } else {
        decision = "not_matched";
        verificationStatus = "rejected";
        verificationMessage = "Certificate name could not be validated.";
      }
    } else if (!extractedEnrollment || !normalizedExtractedName || ocr.confidence < LOW_CONFIDENCE_THRESHOLD) {
      decision = "low_confidence";
      verificationStatus = "not_submitted";
      verificationMessage = "Could not read certificate details clearly. Please re-upload.";
    }

    const update = {
      full_name: declaredFullName || guide.full_name || guide.name,
      ocr_last_result: {
        extracted_name: extractedName,
        extracted_enrollment_no: extractedEnrollment,
        confidence: ocr.confidence,
        match_result: decision,
        verification_message: verificationMessage,
      },
      verification_status: verificationStatus,
      is_verified: isVerified,
      verified_at: isVerified ? new Date() : null,
    };

    if (!isVerified) {
      update.availability = false;
    }

    const updatedGuide = await Guide.findByIdAndUpdate(guide._id, update, { new: true });

    await VerificationAttempt.create({
      guide_id: updatedGuide._id,
      file_url: persisted.relativeUrl,
      extracted_name: extractedName,
      extracted_enrollment_no: extractedEnrollment,
      confidence: ocr.confidence,
      match_result: decision,
      created_at: new Date(),
    });

    return res.json({
      success: true,
      extracted_name: extractedName,
      extracted_enrollment_no: extractedEnrollment,
      confidence: Number(ocr.confidence.toFixed(2)),
      match_result: decision,
      verification_status: updatedGuide.verification_status,
      is_verified: updatedGuide.is_verified,
      message: verificationMessage,
      iitf_exam_url: process.env.IITF_EXAM_URL || DEFAULT_IITF_EXAM_URL,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Verification failed",
    });
  }
};

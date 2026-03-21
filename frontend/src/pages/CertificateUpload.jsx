import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import Navbar from '../components/Navbar'
import { uploadCertificateForVerification } from '../services/bookingService'

export default function CertificateUpload() {
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState(false)
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [verificationResponse, setVerificationResponse] = useState(null)

  const { currentUser, userProfile } = useAuth()
  const navigate = useNavigate()

  function handleFileChange(selectedFile) {
    if (!selectedFile) return
    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Only JPG, PNG or PDF files are allowed.')
      return
    }
    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be under 5MB.')
      return
    }
    setError('')
    setFile(selectedFile)
    // Show preview for images only
    if (selectedFile.type !== 'application/pdf') {
      const reader = new FileReader()
      reader.onload = (e) => setPreview(e.target.result)
      reader.readAsDataURL(selectedFile)
    } else {
      setPreview('pdf')
    }
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    handleFileChange(droppedFile)
  }

  async function handleUpload() {
    if (!file) {
      setError('Please choose a certificate file first.')
      return
    }

    if (!currentUser) {
      setError('Session expired. Please login again.')
      return
    }

    setUploading(true)
    setError('')
    try {
      const verification = await uploadCertificateForVerification(
        file,
        userProfile?.name || currentUser?.displayName || ''
      )
      setVerificationResponse(verification)

      await updateDoc(doc(db, 'users', currentUser.uid), {
        certificateFileName: file.name,
        certificateStatus: verification.verification_status || 'pending',
        certificateUploadedAt: new Date().toISOString(),
        certificateExtractedName: verification.extracted_name || '',
        certificateEnrollmentNo: verification.extracted_enrollment_no || '',
        certificateMatchResult: verification.match_result || '',
      })
      setUploaded(true)
    } catch (err) {
      const message = err?.message || 'Upload failed. Please try again.'
      if (message.toLowerCase().includes('fetch')) {
        setError('Could not reach backend server. Ensure backend is running on port 5001 and reload the page.')
      } else {
        setError(message)
      }
    }
    setUploading(false)
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-cream pt-20">
        {!uploaded ? (
          <>
            {/* HEADER */}
            <div className="text-center mb-12">
              {/* Step Indicator */}
              <div className="flex items-center justify-center gap-3 mb-4">
                {/* Step 1 - Done */}
                <div className="w-8 h-8 rounded-full bg-green-500 text-white text-xs flex items-center justify-center font-bold">
                  ✓
                </div>

                {/* Line */}
                <div className="w-12 h-px bg-sand" />

                {/* Step 2 - Current */}
                <div className="w-8 h-8 rounded-full bg-saffron text-white text-xs flex items-center justify-center font-bold">
                  2
                </div>

                {/* Line */}
                <div className="w-12 h-px bg-sand" />

                {/* Step 3 - Upcoming */}
                <div className="w-8 h-8 rounded-full bg-sand text-charcoal/30 text-xs flex items-center justify-center font-bold">
                  3
                </div>
              </div>

              {/* Step Labels */}
              <div className="flex justify-center gap-8 mt-2 mb-8">
                <span className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider">
                  Account
                </span>
                <span className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider">
                  Certificate
                </span>
                <span className="font-garamond text-xs text-charcoal/50 uppercase tracking-wider">
                  Approved
                </span>
              </div>

              {/* Title */}
              <h1 className="font-playfair text-4xl text-charcoal font-bold mb-3">
                Upload your certificate.
              </h1>
              <p className="font-garamond text-base text-charcoal/60 max-w-md mx-auto">
                We verify all guides using their government issued tourism license.
                This usually takes under 24 hours.
              </p>
            </div>

            {/* INFO BOX */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl px-6 py-4 mb-8 flex items-start gap-4">
              <span className="text-2xl flex-shrink-0">📋</span>
              <div>
                <h3 className="font-playfair text-base text-charcoal font-semibold mb-1">
                  What documents are accepted?
                </h3>
                <ul className="font-garamond text-sm text-charcoal/70 space-y-1">
                  <li>✓ Ministry of Tourism Guide License</li>
                  <li>✓ State Tourism Department Certificate</li>
                  <li>✓ IATO / TAAI Member Certificate</li>
                  <li>✓ Any government-issued guide ID</li>
                </ul>
              </div>
            </div>

            {/* DRAG & DROP ZONE */}
            <input
              type="file"
              id="fileInput"
              hidden
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={(e) => handleFileChange(e.target.files[0])}
            />

            <label
              htmlFor="fileInput"
              onDragOver={(e) => {
                e.preventDefault()
                setDragOver(true)
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={`block border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 mb-6 ${
                dragOver
                  ? 'border-saffron bg-saffron/5'
                  : file
                  ? 'border-green-400 bg-green-50'
                  : 'border-sand bg-sand hover:border-saffron/50'
              }`}
            >
              {!file ? (
                <>
                  <div className="text-5xl mb-4">📎</div>
                  <h3 className="font-playfair text-xl text-charcoal mb-2">
                    Drop your certificate here
                  </h3>
                  <p className="font-garamond text-sm text-charcoal/50">
                    or click to browse files
                  </p>
                  <div className="flex gap-2 justify-center flex-wrap mt-4">
                    <span className="inline-flex bg-cream font-garamond text-xs text-charcoal/50 px-3 py-1 rounded-full border border-sand">
                      JPG
                    </span>
                    <span className="inline-flex bg-cream font-garamond text-xs text-charcoal/50 px-3 py-1 rounded-full border border-sand">
                      PNG
                    </span>
                    <span className="inline-flex bg-cream font-garamond text-xs text-charcoal/50 px-3 py-1 rounded-full border border-sand">
                      PDF
                    </span>
                    <span className="inline-flex bg-cream font-garamond text-xs text-charcoal/50 px-3 py-1 rounded-full border border-sand">
                      Max 5MB
                    </span>
                  </div>
                </>
              ) : preview === 'pdf' ? (
                <>
                  <div className="text-5xl mb-3">📄</div>
                  <h3 className="font-playfair text-lg text-charcoal font-semibold mb-1">
                    {file.name}
                  </h3>
                  <p className="font-garamond text-sm text-charcoal/50 mb-3">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                    }}
                    className="font-garamond text-xs text-saffron cursor-pointer hover:text-terracotta transition-colors"
                  >
                    Change file
                  </button>
                </>
              ) : (
                <>
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-xl object-contain mb-3"
                  />
                  <h3 className="font-playfair text-lg text-charcoal font-semibold mb-1">
                    {file.name}
                  </h3>
                  <p className="font-garamond text-sm text-charcoal/50 mb-3">
                    {(file.size / 1024).toFixed(0)} KB
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null)
                      setPreview(null)
                    }}
                    className="font-garamond text-xs text-saffron cursor-pointer hover:text-terracotta transition-colors"
                  >
                    Change file
                  </button>
                </>
              )}
            </label>

            {/* ERROR MESSAGE */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 font-garamond text-sm px-4 py-3 rounded-xl mb-4">
                {error}
              </div>
            )}

            {/* UPLOAD BUTTON */}
            <button
              disabled={!file || uploading}
              onClick={handleUpload}
              className="w-full bg-charcoal text-cream font-garamond text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Submit Certificate for Verification →'}
            </button>

            {/* SKIP LINK */}
            <div className="text-center mt-4">
              <button
                onClick={() => navigate('/guide-dashboard')}
                className="font-garamond text-xs text-charcoal/40 cursor-pointer hover:text-charcoal/60 transition-colors"
              >
                Skip for now. Upload later from dashboard
              </button>
            </div>
          </>
        ) : (
          <>
            {/* SUCCESS STATE */}
            <div className="text-center py-16">
              {/* Success Icon */}
              <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8">
                <span className="text-5xl">✅</span>
              </div>

              {/* Title */}
              <h1 className="font-playfair text-4xl text-charcoal font-bold mb-4">
                Certificate submitted!
              </h1>

              {/* Subtitle */}
              <p className="font-garamond text-lg text-charcoal/60 max-w-md mx-auto mb-8">
                {verificationResponse?.verification_status === 'verified'
                  ? 'Your certificate is verified. You can now go online from the guide dashboard.'
                  : 'We have received your certificate. If it was not verified automatically, please re-upload a clearer certificate or complete IITF exam registration.'}
              </p>

              {verificationResponse ? (
                <div className="bg-cream border border-sand rounded-xl px-5 py-4 max-w-md mx-auto mb-6 text-left">
                  <p className="font-garamond text-sm text-charcoal/70">Extracted Name: {verificationResponse.extracted_name || 'N/A'}</p>
                  <p className="font-garamond text-sm text-charcoal/70">Enrollment No: {verificationResponse.extracted_enrollment_no || 'N/A'}</p>
                  <p className="font-garamond text-sm text-charcoal/70">Match Result: {verificationResponse.match_result || 'N/A'}</p>
                </div>
              ) : null}

              {/* Status Card */}
              <div className="bg-sand rounded-2xl px-8 py-6 max-w-sm mx-auto mb-8">
                {/* Status Row 1 */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-sand">
                  <span className="font-garamond text-sm text-charcoal/70">
                    Certificate Upload
                  </span>
                  <span className="bg-green-100 text-green-700 font-garamond text-xs px-3 py-1 rounded-full">
                    ✓ Done
                  </span>
                </div>

                {/* Status Row 2 */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-sand">
                  <span className="font-garamond text-sm text-charcoal/70">
                    OCR Verification
                  </span>
                  <span className={`font-garamond text-xs px-3 py-1 rounded-full ${
                    verificationResponse?.verification_status === 'verified'
                      ? 'bg-green-100 text-green-700'
                      : verificationResponse?.verification_status === 'rejected'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {verificationResponse?.verification_status === 'verified'
                      ? '✓ Verified'
                      : verificationResponse?.verification_status === 'rejected'
                      ? '✕ Rejected'
                      : '⏳ Pending'}
                  </span>
                </div>

                {/* Status Row 3 */}
                <div className="flex items-center justify-between">
                  <span className="font-garamond text-sm text-charcoal/70">
                    Dashboard Access
                  </span>
                  <span className="bg-sand text-charcoal/40 font-garamond text-xs px-3 py-1 rounded-full border border-sand">
                    🔒 Locked
                  </span>
                </div>
              </div>

              {/* Button */}
              <button
                onClick={() => navigate('/guide-dashboard')}
                className="w-full max-w-sm mx-auto bg-deepblue text-white font-garamond text-sm uppercase tracking-widest py-4 rounded-xl hover:bg-saffron hover:text-charcoal transition-all duration-300"
              >
                Go to Dashboard →
              </button>
            </div>
          </>
        )}
      </div>
    </>
  )
}

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import padPoster from './assets/pad_poster_page.png';

const DoctorPosterGenerator = () => {
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const contentRef = useRef(null);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Capture and share the layout
  const captureAndShare = async () => {
    if (!contentRef.current) return;
    
    try {
      // Override any styles that might be using modern color formats
      const originalStyles = document.documentElement.style.cssText;
      
      // Apply the capture with a delay to ensure rendering is complete
      setTimeout(async () => {
        try {
          // Create a modified version for capturing
          const canvas = await html2canvas(contentRef.current, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff', // Use standard hex color
            scale: 2,
          });
          
          const image = canvas.toDataURL('image/png');
          
          // Create a link element to download the image
          const link = document.createElement('a');
          link.href = image;
          link.download = `Doctor_Poster_${Date.now()}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // For sharing (Web Share API)
          if (navigator.share) {
            try {
              const blob = await (await fetch(image)).blob();
              const file = new File([blob], 'doctor-poster.png', { type: 'image/png' });
              
              navigator.share({
                files: [file],
                title: 'Doctor Poster',
              }).catch(error => {
                console.log('Error sharing:', error);
              });
            } catch (shareError) {
              console.error('Error with Web Share API:', shareError);
            }
          }
          
          // Restore original styles
          document.documentElement.style.cssText = originalStyles;
          
        } catch (renderError) {
          console.error('Error during html2canvas rendering:', renderError);
          alert('Failed to generate image: ' + renderError.message);
        }
      }, 500);
      
    } catch (error) {
      console.error('Error capturing content:', error);
      alert('Failed to generate image: ' + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      {/* Toolbar/Header - Using standard hex colors instead of Tailwind classes */}
      <div style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', padding: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>STILOZ</h1>
      </div>
      
      {/* Input Form - Now above the poster preview */}
      <div style={{ 
        width: '100%', 
        maxWidth: '28rem', 
        marginTop: '1.5rem', 
        padding: '1rem', 
        backgroundColor: '#ffffff',
        borderRadius: '0.5rem',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        marginBottom: '1rem'
      }}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            Doctor Name
          </label>
          <input
            type="text"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            placeholder="Enter your name"
            style={{ 
              width: '100%',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid #d1d5db',
              outline: 'none',
              fontSize: '0.875rem'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            Specialty
          </label>
          <input
            type="text"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
            placeholder="Enter your specialty"
            style={{ 
              width: '100%',
              padding: '0.5rem',
              borderRadius: '0.25rem',
              border: '1px solid #d1d5db',
              outline: 'none',
              fontSize: '0.875rem'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500', color: '#374151' }}>
            Profile Picture
          </label>
          <div style={{ 
            display: 'flex',
            alignItems: 'center'
          }}>
            <div style={{ 
              width: '3.7rem', 
              height: '3.7rem', 
              borderRadius: '50%', 
              border: '2px solid #d1d5db', 
              overflow: 'hidden', 
              backgroundColor: '#e5e7eb',
              marginRight: '1rem',
              position: 'relative'
            }}>
              {imageUrl ? (
                <img 
                  src={imageUrl} 
                  alt="Doctor" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '100%', 
                  height: '100%', 
                  color: '#6b7280',
                  fontSize: '1.5rem'
                }}>
                  <span>+</span>
                </div>
              )}
              
              <input 
                type="file" 
                accept="image/*" 
                style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                onChange={handleImageChange}
              />
            </div>
            <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
              Click to upload your profile photo
            </span>
          </div>
        </div>
      </div>
      
      {/* Poster Preview */}
      <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <h2 style={{ marginBottom: '0.75rem', fontWeight: '600', color: '#1f2937' }}>Poster Preview</h2>
        
        <div 
          ref={contentRef} 
          style={{ 
            position: 'relative', 
            width: '100%', 
            maxWidth: '28rem', 
            height: '24rem',
            backgroundColor: '#1e40af', 
            overflow: 'hidden'
          }}
        >
          {/* Background Image */}
          <img 
            src={padPoster} 
            alt="Doctor Poster Background" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            crossOrigin="anonymous"
          />
          
          {/* Content overlay - now just displaying, not for input */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            {/* Left-side layout */}
            <div style={{ display: 'flex', padding: '1rem' }}>
              {/* User Image */}
              <div style={{ 
                width: '3.7rem', 
                height: '3.7rem', 
                borderRadius: '50%', 
                border: '2.5px solid #ffffff', 
                overflow: 'hidden', 
                backgroundColor: '#e5e7eb',
                marginRight: '0.75rem'
              }}>
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="Doctor" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '100%', 
                    height: '100%', 
                    color: '#6b7280' 
                  }}>
                    <span>+</span>
                  </div>
                )}
              </div>
              
              {/* Text content - aligned to the left of the image */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span
                  style={{ 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    fontSize: '0.5rem',
                    marginBottom: '0.25rem',
                    textAlign: 'left',
                    display: 'block'
                  }}
                >
                  {doctorName || "Enter your name"}
                </span>
                
                <span
                  style={{ 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    fontSize: '0.395rem',
                    textAlign: 'left',
                    display: 'block'
                  }}
                >
                  {specialty || "Enter your specialty"}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Share Button */}
        <button 
          onClick={captureAndShare}
          style={{ 
            marginTop: '1rem', 
            padding: '0.5rem 1.5rem', 
            backgroundColor: '#fef3c7', // amber-200 equivalent
            color: '#b91c1c', // red-700 equivalent
            fontWeight: '600', 
            borderRadius: '0.375rem', 
            transition: 'background-color 0.2s' 
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#fde68a'} // amber-300 equivalent
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'} // amber-200 equivalent
        >
          Share
        </button>
      </div>
    </div>
  );
};

export default DoctorPosterGenerator;

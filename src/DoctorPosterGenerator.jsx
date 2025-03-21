import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';

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
            // This function runs on a clone of the DOM before rendering
            onclone: (clonedDoc) => {
              // Get the cloned input elements
              const nameInputClone = clonedDoc.getElementById('doctorNameInput');
              const specialtyInputClone = clonedDoc.getElementById('specialtyInput');
              
              // Replace the input values with span elements at exactly the same position
              if (nameInputClone && specialtyInputClone) {
                // Create spans with exact same styling as inputs
                const nameSpan = clonedDoc.createElement('span');
                nameSpan.textContent = doctorName || "Enter your name";
                // Copy all styles from input to span
                const nameStyles = window.getComputedStyle(document.getElementById('doctorNameInput'));
                for (let style of nameStyles) {
                  nameSpan.style[style] = nameStyles.getPropertyValue(style);
                }
                nameSpan.style.position = nameInputClone.style.position;
                nameSpan.style.top = nameInputClone.style.top;
                nameSpan.style.left = nameInputClone.style.left;
                
                const specialtySpan = clonedDoc.createElement('span');
                specialtySpan.textContent = specialty || "Enter your specialty";
                // Copy all styles from input to span
                const specialtyStyles = window.getComputedStyle(document.getElementById('specialtyInput'));
                for (let style of specialtyStyles) {
                  specialtySpan.style[style] = specialtyStyles.getPropertyValue(style);
                }
                specialtySpan.style.position = specialtyInputClone.style.position;
                specialtySpan.style.top = specialtyInputClone.style.top;
                specialtySpan.style.left = specialtyInputClone.style.left;
                
                // Replace inputs with spans
                nameInputClone.parentNode.replaceChild(nameSpan, nameInputClone);
                specialtyInputClone.parentNode.replaceChild(specialtySpan, specialtyInputClone);
              }
            }
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
      
      {/* Main Content */}
      <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Poster Content */}
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
            src="/pad_poster_page.png" 
            alt="Doctor Poster Background" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            crossOrigin="anonymous"
          />
          
          {/* Input area overlay */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
            {/* User Image */}
            <div style={{ marginTop: '1rem', marginLeft: '1rem' }}>
              <div style={{ 
                position: 'relative', 
                width: '3.7rem', 
                height: '3.7rem', 
                borderRadius: '50%', 
                border: '2.5px solid #ffffff', 
                overflow: 'hidden', 
                backgroundColor: '#e5e7eb' 
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
                
                {/* Hidden file input */}
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                  onChange={handleImageChange}
                />
              </div>
            </div>
            
            {/* Text inputs - using exact positioning to match the design */}
            <input
              id="doctorNameInput"
              type="text"
              value={doctorName}
              onChange={(e) => setDoctorName(e.target.value)}
              placeholder="Enter your name"
              style={{ 
                position: 'absolute',
                top: '1.2rem',
                left: '5.2rem', // 1rem + 3.7rem + 0.5rem
                backgroundColor: 'transparent', 
                color: '#ffffff', 
                fontWeight: 'bold', 
                fontSize: '0.5rem',
                width: '10rem',
                border: 'none',
                outline: 'none',
                padding: '0',
                lineHeight: '4'
              }}
            />
            
            <input
              id="specialtyInput"
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Enter your specialty"
              style={{ 
                position: 'absolute',
                top: 'calc(1.25rem + 0.81rem)', // doctorName position + spacing
                left: '5.2rem', // 1rem + 3.7rem + 0.5rem
                backgroundColor: 'transparent', 
                color: '#ffffff', 
                fontWeight: 'bold', 
                fontSize: '0.395rem',
                width: '10rem',
                border: 'none',
                outline: 'none',
                padding: '0',
                lineHeight: '5'
              }}
            />
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

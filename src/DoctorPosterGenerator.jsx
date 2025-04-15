import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import padPoster from './assets/pad_poster_page.png';

const DoctorPosterGenerator = () => {
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [originalImage, setOriginalImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropBox, setCropBox] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [imgDimensions, setImgDimensions] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropScale, setCropScale] = useState(1);
  const [resizeMode, setResizeMode] = useState(null); // null, 'nw', 'ne', 'sw', 'se'
  
  const contentRef = useRef(null);
  const cropperRef = useRef(null);
  const imgRef = useRef(null);

  // Handle initial image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target.result);
        // Show the cropper after image is loaded
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  // Initialize cropper after image is loaded
  useEffect(() => {
    if (originalImage && showCropper) {
      const img = new Image();
      img.onload = () => {
        // Get dimensions of the loaded image
        const width = img.width;
        const height = img.height;
        setImgDimensions({ width, height });
        
        // Set initial crop box to be centered and square (using the smaller dimension)
        const size = Math.min(width, height) * 0.8;
        setCropBox({
          x: (width - size) / 2,
          y: (height - size) / 2,
          width: size,
          height: size
        });
      };
      img.src = originalImage;
    }
  }, [originalImage, showCropper]);

  // Mouse/Touch event handlers for cropping
  const handleMouseDown = (e) => {
    e.preventDefault();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!clientX || !clientY) return;
    
    const cropperRect = cropperRef.current.getBoundingClientRect();
    const scaleX = imgDimensions.width / cropperRect.width;
    
    // Check if we're clicking on a resize handle
    if (e.target.className && e.target.className.includes('resize-handle')) {
      const handlePosition = e.target.getAttribute('data-position');
      setResizeMode(handlePosition);
    } else {
      setIsDragging(true);
    }
    
    setDragStart({
      x: (clientX - cropperRect.left) * scaleX - cropBox.x,
      y: (clientY - cropperRect.top) * scaleX - cropBox.y
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging && !resizeMode) return;
    
    e.preventDefault();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);
    
    if (!clientX || !clientY) return;
    
    const cropperRect = cropperRef.current.getBoundingClientRect();
    const scaleX = imgDimensions.width / cropperRect.width;
    const mouseX = (clientX - cropperRect.left) * scaleX;
    const mouseY = (clientY - cropperRect.top) * scaleX;

    // Handle resize mode
    if (resizeMode) {
      let newCropBox = { ...cropBox };
      
      switch (resizeMode) {
        case 'nw': // northwest
          const widthChangeNW = cropBox.x + cropBox.width - mouseX;
          const heightChangeNW = cropBox.y + cropBox.height - mouseY;
          
          // Maintain aspect ratio (square)
          const changeNW = Math.max(widthChangeNW, heightChangeNW);
          
          newCropBox = {
            x: Math.max(0, cropBox.x + cropBox.width - changeNW),
            y: Math.max(0, cropBox.y + cropBox.height - changeNW),
            width: changeNW,
            height: changeNW
          };
          break;
          
        case 'ne': // northeast
          const widthChangeNE = mouseX - cropBox.x;
          const heightChangeNE = cropBox.y + cropBox.height - mouseY;
          
          // Maintain aspect ratio (square)
          const changeNE = Math.max(widthChangeNE, heightChangeNE);
          
          newCropBox = {
            x: cropBox.x,
            y: Math.max(0, cropBox.y + cropBox.height - changeNE),
            width: changeNE,
            height: changeNE
          };
          break;
          
        case 'sw': // southwest
          const widthChangeSW = cropBox.x + cropBox.width - mouseX;
          const heightChangeSW = mouseY - cropBox.y;
          
          // Maintain aspect ratio (square)
          const changeSW = Math.max(widthChangeSW, heightChangeSW);
          
          newCropBox = {
            x: Math.max(0, cropBox.x + cropBox.width - changeSW),
            y: cropBox.y,
            width: changeSW,
            height: changeSW
          };
          break;
          
        case 'se': // southeast
          const widthChangeSE = mouseX - cropBox.x;
          const heightChangeSE = mouseY - cropBox.y;
          
          // Maintain aspect ratio (square)
          const changeSE = Math.min(
            Math.max(50, Math.min(widthChangeSE, heightChangeSE)), 
            Math.min(imgDimensions.width - cropBox.x, imgDimensions.height - cropBox.y)
          );
          
          newCropBox = {
            x: cropBox.x,
            y: cropBox.y,
            width: changeSE,
            height: changeSE
          };
          break;
          
        default:
          break;
      }
      
      // Ensure minimum size
      if (newCropBox.width < 50) newCropBox.width = 50;
      if (newCropBox.height < 50) newCropBox.height = 50;
      
      // Ensure crop box stays within image bounds
      if (newCropBox.x + newCropBox.width > imgDimensions.width) {
        newCropBox.width = imgDimensions.width - newCropBox.x;
      }
      if (newCropBox.y + newCropBox.height > imgDimensions.height) {
        newCropBox.height = imgDimensions.height - newCropBox.y;
      }
      
      setCropBox(newCropBox);
    }
    // Handle drag mode
    else if (isDragging) {
      // Calculate new position
      let newX = mouseX - dragStart.x;
      let newY = mouseY - dragStart.y;
      
      // Keep box within image bounds
      newX = Math.max(0, Math.min(imgDimensions.width - cropBox.width, newX));
      newY = Math.max(0, Math.min(imgDimensions.height - cropBox.height, newY));
      
      setCropBox(prev => ({
        ...prev,
        x: newX,
        y: newY
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setResizeMode(null);
  };

  // Apply crop to the image
  const applyCrop = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions to match crop box
    canvas.width = cropBox.width;
    canvas.height = cropBox.height;
    
    // Create a temporary image to draw from
    const img = new Image();
    img.onload = () => {
      // Draw the cropped portion of the image
      ctx.drawImage(
        img,
        cropBox.x, cropBox.y, cropBox.width, cropBox.height,
        0, 0, cropBox.width, cropBox.height
      );
      
      // Create final optimized output
      const croppedImage = canvas.toDataURL('image/jpeg', 0.9);
      setImageUrl(croppedImage);
      setShowCropper(false);
    };
    img.src = originalImage;
  };

  // Cancel cropping
  const cancelCrop = () => {
    setShowCropper(false);
    if (!imageUrl) {
      // If canceling before setting any image, clear the original image too
      setOriginalImage(null);
    }
  };

  // Calculate scaled crop box for display
  useEffect(() => {
    if (cropperRef.current && imgDimensions.width > 0) {
      const cropperWidth = cropperRef.current.clientWidth;
      const scale = cropperWidth / imgDimensions.width;
      setCropScale(scale);
    }
  }, [cropperRef, imgDimensions, showCropper]);

  // Capture and share the layout
  const captureAndShare = async () => {
    if (!contentRef.current) return;
    
    try {
      // Override any styles that might be using modern color formats
      const originalStyles = document.documentElement.style.cssText;
      
      // Apply the capture with a delay to ensure rendering is complete
      setTimeout(async () => {
        try {
          // Create a modified version for capturing with improved quality
          const canvas = await html2canvas(contentRef.current, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            scale: 2, // Ensure consistent scale for better quality
            logging: false,
            imageRendering: 'pixelated'
          });
          
          const image = canvas.toDataURL('image/png', 1.0); // Use maximum quality
          
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
      {/* Modal for image cropping - Modified for better mobile support */}
      {showCropper && originalImage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1rem',
          overflowY: 'auto' // Allow scrolling on mobile
        }}>
          <div style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh', // Prevent modal from being too tall
            margin: '10px' // Ensure margin on all sides
          }}>
            <div style={{
              padding: '1rem',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Crop Image</h3>
              <button 
                onClick={cancelCrop}
                style={{ fontSize: '1.5rem', background: 'none', border: 'none', cursor: 'pointer' }}
              >×</button>
            </div>
            
            {/* Cropper area */}
            <div 
              ref={cropperRef}
              style={{ 
                position: 'relative', 
                width: '100%', 
                paddingTop: `${(imgDimensions.height / imgDimensions.width) * 100}%`, 
                overflow: 'hidden',
                touchAction: 'none'
              }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={handleMouseUp}
            >
              {/* Original image */}
              <img
                ref={imgRef}
                src={originalImage}
                alt="Original"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain'
                }}
              />
              
              {/* Overlay with hole for crop area */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)'
              }}>
                {/* Crop box */}
                <div style={{
                  position: 'absolute',
                  left: `${cropBox.x * cropScale}px`,
                  top: `${cropBox.y * cropScale}px`,
                  width: `${cropBox.width * cropScale}px`,
                  height: `${cropBox.height * cropScale}px`,
                  border: '2px dashed white',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)',
                  boxSizing: 'border-box',
                  cursor: 'move'
                }}>
                  {/* Resize handles */}
                  <div 
                    className="resize-handle resize-nw" 
                    data-position="nw"
                    style={{
                      position: 'absolute',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      cursor: 'nwse-resize',
                      top: '-7px',
                      left: '-7px',
                      zIndex: 10
                    }}
                  ></div>
                  <div 
                    className="resize-handle resize-ne" 
                    data-position="ne"
                    style={{
                      position: 'absolute',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      cursor: 'nesw-resize',
                      top: '-7px',
                      right: '-7px',
                      zIndex: 10
                    }}
                  ></div>
                  <div 
                    className="resize-handle resize-sw" 
                    data-position="sw"
                    style={{
                      position: 'absolute',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      cursor: 'nesw-resize',
                      bottom: '-7px',
                      left: '-7px',
                      zIndex: 10
                    }}
                  ></div>
                  <div 
                    className="resize-handle resize-se" 
                    data-position="se"
                    style={{
                      position: 'absolute',
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      cursor: 'nwse-resize',
                      bottom: '-7px',
                      right: '-7px',
                      zIndex: 10
                    }}
                  ></div>
                </div>
              </div>
            </div>
            
            {/* Crop instructions */}
            <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.9rem', color: '#6b7280' }}>
              Drag to position or use handles to resize the crop area
            </div>
            
            {/* Action buttons - Fixed for mobile */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '1rem',
              borderTop: '1px solid #e5e7eb',
              position: 'sticky', // Make it sticky for mobile scrolling
              bottom: 0,
              backgroundColor: 'white' // Ensure background color
            }}>
              <button
                onClick={cancelCrop}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #d1d5db',
                  backgroundColor: '#f9fafb',
                  color: '#374151',
                  fontWeight: '500',
                  width: '48%', // Make buttons fill space
                  minHeight: '44px' // Larger touch target for mobile
                }}
              >
                Cancel
              </button>
              
              <button
                onClick={applyCrop}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '0.375rem',
                  backgroundColor: '#1e40af',
                  color: '#ffffff',
                  fontWeight: '500',
                  width: '48%', // Make buttons fill space
                  minHeight: '44px' // Larger touch target for mobile
                }}
              >
                Apply Crop
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Toolbar/Header */}
      <div style={{ width: '100%', backgroundColor: '#000000', color: '#ffffff', padding: '1rem', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>STILOZ</h1>
      </div>
      
      {/* Input Form */}
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
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                  <img 
                    src={imageUrl} 
                    alt="Doctor" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      imageRendering: 'crisp-edges',
                    }}
                  />
                  <div 
                    style={{ 
                      position: 'absolute', 
                      inset: 0, 
                      backgroundColor: 'rgba(0, 0, 0, 0.4)', 
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: 'white',
                      fontSize: '0.75rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.opacity = 1}
                    onMouseOut={(e) => e.currentTarget.style.opacity = 0}
                    onClick={() => {
                      setShowCropper(true);
                    }}
                  >
                    Edit
                  </div>
                </div>
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
              {imageUrl 
                ? "Click to change your profile photo" 
                : "Click to upload your profile photo"}
            </span>
          </div>
        </div>
        
        {/* Submit Button for Form */}
        <button
          style={{
            width: '100%',
            padding: '0.625rem',
            backgroundColor: '#1e40af',
            color: '#ffffff',
            fontWeight: '500',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.875rem',
            marginTop: '0.5rem'
          }}
          onClick={() => {
            // Form submission logic if needed
            // For now, this just acknowledges the form is complete
            if (imageUrl && doctorName && specialty) {
              alert('Profile information saved!');
            } else {
              alert('Please complete all fields.');
            }
          }}
        >
          Save Profile
        </button>
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
          
          {/* Content overlay */}
          <div style={{ position: 'absolute', top: -2.5, left: 0, width: '100%', height: '100%' }}>
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
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      imageRendering: 'crisp-edges',
                    }}
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
              
              {/* Text content */}
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span
                  style={{ 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    fontSize: '0.75rem',
                    marginBottom: '0rem',
                    textAlign: 'left',
                    display: 'block',
                    top: '10rem'
                  }}
                >
                  {doctorName || "Enter your name"}
                </span>
                
                <span
                  style={{ 
                    color: '#ffffff', 
                    fontWeight: 'bold', 
                    fontSize: '0.6rem',
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
          disabled={!imageUrl || !doctorName || !specialty}
          style={{ 
            marginTop: '1rem', 
            padding: '0.5rem 1.5rem', 
            backgroundColor: (!imageUrl || !doctorName || !specialty) ? '#e5e7eb' : '#fef3c7', // Disabled state
            color: (!imageUrl || !doctorName || !specialty) ? '#9ca3af' : '#b91c1c',
            fontWeight: '600', 
            borderRadius: '0.375rem', 
            transition: 'background-color 0.2s',
            cursor: (!imageUrl || !doctorName || !specialty) ? 'not-allowed' : 'pointer'
          }}
          onMouseOver={(e) => {
            if (imageUrl && doctorName && specialty) {
              e.currentTarget.style.backgroundColor = '#fde68a';
            }
          }}
          onMouseOut={(e) => {
            if (imageUrl && doctorName && specialty) {
              e.currentTarget.style.backgroundColor = '#fef3c7';
            }
          }}
        >
          Generate & Share Poster
        </button>
        
        {/* Instructions if form is incomplete */}
        {(!imageUrl || !doctorName || !specialty) && (
          <div style={{
            marginTop: '0.5rem',
            fontSize: '0.75rem',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            Please complete all fields to generate your poster
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorPosterGenerator;
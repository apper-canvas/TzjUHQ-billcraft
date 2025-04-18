import { useState } from 'react';

const PrintButton = ({ target, children, className, ...props }) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrint = () => {
    setIsPrinting(true);

    // Save current styles
    const originalStyles = {
      bodyOverflow: document.body.style.overflow,
      bodyBackground: document.body.style.background,
      htmlBackground: document.documentElement.style.background,
    };

    // Create new styles for printing just the target
    const style = document.createElement('style');
    style.type = 'text/css';
    style.id = 'print-style';
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden;
          background-color: white !important;
          color: black !important;
        }
        body {
          background-color: white !important;
        }
        #${target}, #${target} * {
          visibility: visible;
          color: black !important;
        }
        #${target} {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          background-color: white !important;
          box-shadow: none !important;
          border: none !important;
        }
        @page {
          size: auto;
          margin: 10mm;
        }
      }
    `;
    document.head.appendChild(style);

    // Set temporary styles for printing
    document.body.style.overflow = 'visible';
    document.body.style.background = 'white';
    document.documentElement.style.background = 'white';

    // Print and then cleanup
    setTimeout(() => {
      window.print();
      
      // Remove print styles
      document.head.removeChild(style);
      
      // Restore original styles
      document.body.style.overflow = originalStyles.bodyOverflow;
      document.body.style.background = originalStyles.bodyBackground;
      document.documentElement.style.background = originalStyles.htmlBackground;
      
      setIsPrinting(false);
    }, 100);
  };

  return (
    <button
      type="button"
      onClick={handlePrint}
      disabled={isPrinting}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
};

export default PrintButton;
// Theme configuration for the laptop store
export const theme = {
  colors: {
    primary: '#000000',       // Black
    secondary: '#FFFFFF',     // White
    accent: '#00CCFF',        // Cyan/Teal for hover and highlights
    gray: {
      100: '#F8F9FA',
      200: '#E9ECEF',
      300: '#DEE2E6',
      400: '#CED4DA',
      500: '#ADB5BD',
      600: '#6C757D',
      700: '#495057',
      800: '#343A40',
      900: '#212529',
    },
    success: '#28A745',
    danger: '#DC3545',
    warning: '#FFC107',
    info: '#17A2B8',
  },
  fonts: {
    body: "'Montserrat', sans-serif",
    heading: "'Poppins', sans-serif",
  },
  shadows: {
    small: '0 2px 5px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.12)',
    large: '0 8px 16px rgba(0, 0, 0, 0.15)',
    button: '0 4px 0 #000000',
    buttonHover: '0 6px 0 #000000',
  },
  borderRadius: {
    small: '4px',
    medium: '8px',
    large: '12px',
    xl: '16px',
    pill: '9999px',
  },
  transitions: {
    fast: '0.15s ease',
    medium: '0.3s ease',
    slow: '0.5s ease',
  },
};

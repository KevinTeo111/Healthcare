import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{
      backgroundColor: '#004080',
      color: 'white',
      textAlign: 'center',
      padding: '1.5rem 2rem',
      marginTop: '2rem',
      fontSize: '0.9rem',
    }}>
      <p>© 2025 HealthSync</p>
      <p>
        <a href="/privacy" style={{ color: 'white', textDecoration: 'underline', marginRight: '1rem' }}>Privacy Policy</a>
        <a href="/terms" style={{ color: 'white', textDecoration: 'underline' }}>Terms of Service</a>
      </p>
    </footer>
  );
};

export default Footer;

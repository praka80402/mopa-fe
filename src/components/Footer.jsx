import React from 'react';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ backgroundColor: 'var(--primary-navy)', color: '#94A3B8', padding: '40px 0 20px 0', borderTop: '4px solid var(--accent-saffron)' }}>
      <div className="container">
        {/* Footer Top Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', marginBottom: '35px' }}>
          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '15px', borderBottom: '2px solid var(--accent-saffron)', paddingBottom: '8px', display: 'inline-block', fontSize: '0.95rem' }}>
              Parliament Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><a href="https://sansad.in/ls" target="_blank" rel="noreferrer" style={{ hover: { color: '#FFFFFF' } }}>Lok Sabha</a></li>
              <li><a href="https://sansad.in/rs" target="_blank" rel="noreferrer">Rajya Sabha</a></li>
              <li><a href="https://www.presidentofindia.nic.in/" target="_blank" rel="noreferrer">President of India</a></li>
              <li><a href="https://www.pmindia.gov.in/" target="_blank" rel="noreferrer">Prime Minister's Office</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '15px', borderBottom: '2px solid var(--accent-saffron)', paddingBottom: '8px', display: 'inline-block', fontSize: '0.95rem' }}>
              Useful Links
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><a href="https://www.india.gov.in/" target="_blank" rel="noreferrer">National Portal of India</a></li>
              <li><a href="https://www.nic.in/" target="_blank" rel="noreferrer">National Informatics Centre</a></li>
              <li><a href="https://www.digitalindia.gov.in/" target="_blank" rel="noreferrer">Digital India Portal</a></li>
              <li><a href="https://pgportal.gov.in/" target="_blank" rel="noreferrer">Centralized Public Grievance Portal</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '15px', borderBottom: '2px solid var(--accent-saffron)', paddingBottom: '8px', display: 'inline-block', fontSize: '0.95rem' }}>
              Ministry Support
            </h4>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              For queries related to Parliamentary procedures, Youth Parliament competitions, or RTI applications, please visit the contact section.
            </p>
          </div>

          <div>
            <h4 style={{ color: '#FFFFFF', marginBottom: '15px', borderBottom: '2px solid var(--accent-saffron)', paddingBottom: '8px', display: 'inline-block', fontSize: '0.95rem' }}>
              Contact Address
            </h4>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6' }}>
              Ministry of Parliamentary Affairs<br />
              86, Parliament House, New Delhi - 110001<br />
              Email: dmpa-mpa@nic.in
            </p>
          </div>
        </div>

        {/* Footer Bottom copyright and warning details */}
        <div style={{ borderTop: '1px solid #1E293B', paddingTop: '20px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
          <div>
            <p>© {currentYear} Ministry of Parliamentary Affairs, Government of India. All Rights Reserved.</p>
            <p style={{ fontSize: '0.75rem', marginTop: '4px', color: '#64748B' }}>
              Website designed, developed and hosted by National Informatics Centre (NIC). Content provided by MoPA.
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
            <span>Website Policies</span>
            <span>|</span>
            <span>Help</span>
            <span>|</span>
            <span>Feedback</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

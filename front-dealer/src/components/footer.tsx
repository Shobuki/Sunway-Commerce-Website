import React from 'react';
import { CSSProperties } from 'react';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Information Section */}
        <div style={styles.column}>
          <h4 style={styles.heading}>Information</h4>
          <p style={styles.text}>Description of your information</p>
        </div>

        {/* Our Product Section */}
        <div style={styles.column}>
          <h4 style={styles.heading}>Our Product</h4>
          <ul style={styles.list}>
            <li style={styles.listItem}>Hose & Fittings</li>
            <li style={styles.listItem}>Heavy Equipment Parts</li>
            <li style={styles.listItem}>Heavy Equipments</li>
          </ul>
        </div>

        {/* Other Links Section */}
        <div style={styles.column}>
          <h4 style={styles.heading}>Other Links</h4>
          <ul style={styles.list}>
            <li style={styles.listItem}>Malaysia</li>
            <li style={styles.listItem}>Singapore</li>
            <li style={styles.listItem}>Australia</li>
            <li style={styles.listItem}>Thailand</li>
            <li style={styles.listItem}>China</li>
            <li style={styles.listItem}>Indonesia</li>
          </ul>
        </div>

        {/* Contact Section */}
        <div style={styles.column}>
          <h4 style={styles.heading}>Contact</h4>
          <p style={styles.text}>
            Office Hours: <br />
            Monday - Friday: 08.00 - 17.00 (GMT+7) <br />
            Saturday: 08.00 - 12.00 (GMT+7)
          </p>
          <p style={styles.text}>
            Email: <a href="mailto:ipsales@sunway.com.my" style={styles.link}>ipsales@sunway.com.my</a>
            <br />
            Website: <a href="http://www.sunway.co.id" style={styles.link}>www.sunway.co.id</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

const styles: { [key: string]: CSSProperties } = {
  footer: {
    backgroundColor: '#C72C3B',
    color: '#FFFFFF',
    padding: '40px 20px',
    textAlign: 'left' as CSSProperties['textAlign'],
  },
  container: {
    display: 'flex',
    justifyContent: 'space-around' as CSSProperties['justifyContent'],
    flexWrap: 'wrap' as CSSProperties['flexWrap'],
    maxWidth: '1200px',
    margin: '0 auto',
  },
  column: {
    flex: '1',
    minWidth: '200px',
    marginBottom: '20px',
  },
  heading: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    textTransform: 'uppercase' as CSSProperties['textTransform'],
    borderBottom: '2px solid #FFFFFF',
    paddingBottom: '5px',
  },
  text: {
    fontSize: '14px',
    lineHeight: '1.5',
  },
  list: {
    listStyleType: 'none',
    padding: '0',
  },
  listItem: {
    marginBottom: '8px',
    cursor: 'pointer',
    transition: 'color 0.3s',
  },
  link: {
    color: '#FFD700',
    textDecoration: 'none',
  },
};

export default Footer;

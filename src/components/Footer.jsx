import styles from "./Footer.module.css";

function Footer() {
  return (
    <footer className={styles.footer}>
      <p className={styles.copyright}>
        &copy; CoppyRight {new Date().getFullYear()} by WorldWice Inc.
      </p>
    </footer>
  );
}

export default Footer;

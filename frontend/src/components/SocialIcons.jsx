function Icon({ children }) {
  return <span className="icon" aria-hidden="true">{children}</span>;
}

export default function SocialIcons() {
  return (
    <div className="socialRow">
      <a className="iconBtn" href="https://instagram.com/YOUR_PAGE" target="_blank" rel="noreferrer" aria-label="Instagram" title="Instagram">
        <Icon>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm10 2H7a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm-5 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm6.5-.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0z"/>
          </svg>
        </Icon>
      </a>

      <a className="iconBtn" href="https://facebook.com/YOUR_PAGE" target="_blank" rel="noreferrer" aria-label="Facebook" title="Facebook">
        <Icon>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M13.5 22v-8h2.7l.4-3H13.5V9.1c0-.9.3-1.6 1.6-1.6h1.6V4.8c-.3 0-1.4-.1-2.7-.1-2.6 0-4.4 1.6-4.4 4.5V11H7v3h2.6v8h3.9z"/>
          </svg>
        </Icon>
      </a>

      <a className="iconBtn" href="https://x.com/YOUR_PAGE" target="_blank" rel="noreferrer" aria-label="X" title="X">
        <Icon>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M18.9 2H22l-6.8 7.8L23 22h-6.7l-5.3-6.7L5.3 22H2l7.3-8.4L1 2h6.8l4.8 6.1L18.9 2zm-1.2 18h1.8L6.2 3.9H4.3L17.7 20z"/>
          </svg>
        </Icon>
      </a>

      <a className="iconBtn" href="https://youtube.com/@YOUR_CHANNEL" target="_blank" rel="noreferrer" aria-label="YouTube" title="YouTube">
        <Icon>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M21.6 7.2a3 3 0 0 0-2.1-2.1C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.5.5A3 3 0 0 0 2.4 7.2 31.4 31.4 0 0 0 2 12a31.4 31.4 0 0 0 .4 4.8 3 3 0 0 0 2.1 2.1c1.8.5 7.5.5 7.5.5s5.7 0 7.5-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 22 12a31.4 31.4 0 0 0-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z"/>
          </svg>
        </Icon>
      </a>
    </div>
  );
}

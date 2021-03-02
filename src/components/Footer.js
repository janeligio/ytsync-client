export default function Footer() {
    return (
    <footer id="app-footer">
        <div className="footer-section">
            <h3 className="footer-section-header">About</h3>
            <p>
            Made by <CustomLink href="https://www.janeligio.com/">Jan Iverson Eligio</CustomLink>
            <br/>with 
                <CustomLink href="https://nodejs.org/en/">{` `}Node</CustomLink>, 
                <CustomLink href="https://reactjs.org/">{` `} React</CustomLink>, 
                <CustomLink href="https://socket.io/">{` `} Socket.io</CustomLink>, 
                and &#10084;.
            </p>
        </div>
        <div className="footer-section">
            <h3 className="footer-section-header">Repositories</h3>
            <p>
                <CustomLink href="https://github.com/janeligio/ytsync-client" target="_blank" rel="noopener noreferrer">
                    Frontend
                </CustomLink>
                <br/>
                <CustomLink href="https://github.com/janeligio/ytsync-server" target="_blank" rel="noopener noreferrer">
                    Backend
                </CustomLink>
            </p>
        </div>
        <div className="footer-section">
            <p>
                <CustomLink href="https://github.com/janeligio">GitHub</CustomLink>
                <br/>
                <CustomLink href="https://twitter.com/janeligio">Twitter</CustomLink>
            </p>
        </div>
    </footer>);
}

function CustomLink({ href, children}) {
    return (
        <a className="footer-link" href={href} target="_blank" rel="noopener noreferrer">
            {children}
        </a>
    );
}
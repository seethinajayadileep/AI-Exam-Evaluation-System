import './NotFound.css';
function NotFound(){

    return (
       <>
       <div className='not-body'>
    <div className="not-floating-shapes">
        <div className="not-shape">📚</div>
        <div className="not-shape">🎓</div>
        <div className="not-shape">✏️</div>
        <div className="not-shape">📖</div>
    </div>
    
    <div className="not-container">
        <div className="not-error-code">404</div>
        <h1 className="not-error-message">Oops! Page Not Found</h1>
        <p className="not-error-description">
            The page you're looking for seems to have wandered off. 
            Don't worry, even the best students sometimes get lost!
        </p>
        <a href="/" className="not-home-button">Return to Home</a>
    </div>
    </div>
    </>

    )
}
export default NotFound;

import './Spinner.css';

export const Spinner = () => {
    return (
        <div className="spinner_wrapper">
            <div
                className="spinner"
                role="status"
                aria-label="Loading"
            ></div>
        </div>
    );
};
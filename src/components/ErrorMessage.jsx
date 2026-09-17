function ErrorMessage({message}){

    return(

        <div className="error-box">

            <h2>Something went wrong</h2>

            <p>{message}</p>

        </div>

    );

}

export default ErrorMessage;
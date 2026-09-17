import { useState } from "react";

function Contact() {

    const [message, setMessage] = useState("");
    const [showTips, setShowTips] = useState(false);

    return (

        <div className="container">

            <h1 className="page-title">
                Contact Me
            </h1>

            <div className="contact-card">

                <input
                    type="text"
                    placeholder="Your Name"
                />

                <input
                    type="email"
                    placeholder="Your Email"
                />

                <textarea

                    rows="6"

                    placeholder="Write your message..."

                    value={message}

                    onChange={(e)=>setMessage(e.target.value)}

                />

                <button
                    className="send-btn"
                    onClick={()=>setShowTips(!showTips)}
                >
                    {showTips ? "Hide Tips" : "Show Tips"}
                </button>

                {

                    showTips &&

                    <div className="tips">

                        Keep your message short and professional.

                    </div>

                }

                <h3>Live Preview</h3>

                <p>{message}</p>

                <p>

                    Characters : {message.length}

                </p>

            </div>

        </div>

    );

}

export default Contact;
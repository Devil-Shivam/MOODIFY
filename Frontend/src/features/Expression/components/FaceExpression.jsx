import { useEffect, useRef, useState } from "react";
import { detect, init } from "../utils/utils";


export default function FaceExpression({ onClick = () => { } }) {
    const videoRef = useRef(null);
    const landmarkerRef = useRef(null);
    const streamRef = useRef(null);

    const [ expression, setExpression ] = useState("Detecting...");

    const expressionLabels = {
        happy: { emoji: "😄", label: "Happy" },
        neutral: { emoji: "😐", label: "Neutral" },
        surprised: { emoji: "😲", label: "Surprised" },
        sad: { emoji: "😢", label: "Sad" },
        "Detecting...": { emoji: "⏳", label: "Detecting..." },
        "Camera unavailable": { emoji: "📷", label: "Camera unavailable" }
    };

    const displayStatus = expressionLabels[ expression ]
        ? `${expressionLabels[ expression ].emoji} ${expressionLabels[ expression ].label}`
        : expression;

    useEffect(() => {
        const initialize = async () => {
            try {
                await init({ landmarkerRef, videoRef, streamRef });
            } catch (error) {
                console.error("Face Expression init failed", error);
                setExpression("Camera unavailable")
            }
        };

        initialize();

        return () => {
            if (landmarkerRef.current) {
                landmarkerRef.current.close();
            }

            if (videoRef.current?.srcObject) {
                videoRef.current.srcObject
                    .getTracks()
                    .forEach((track) => track.stop());
            }
        };
    }, []);

    async function handleClick() {
        const expression = detect({ landmarkerRef, videoRef, setExpression })
        if (expression) {
            setExpression(expression)
            onClick(expression)
        }
    }


    return (
        <div className="face-expression">
            <div className="face-expression__canvas">
                <video
                    ref={videoRef}
                    className="face-expression__video"
                    playsInline
                />
            </div>
            <p className="face-expression__status">{displayStatus}</p>
            <button className="button button--ghost face-expression__button" onClick={handleClick}>
                Detect expression
            </button>
        </div>
    );
}
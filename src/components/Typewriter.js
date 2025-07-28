import { useEffect, useState } from "react";

const Typewriter = ({ text, speed = 20 }) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return <div dangerouslySetInnerHTML={{ __html: displayedText }} />;
};

export default Typewriter;

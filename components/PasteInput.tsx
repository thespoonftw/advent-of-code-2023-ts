import { useState } from 'react';

export default function PasteInput() {

  const [inputText, setInputText] = useState('');

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(event.target.value);
  };
  
  return (
    <div>
        <textarea value={inputText} onChange={handleInputChange}></textarea>
    </div>
  );
}

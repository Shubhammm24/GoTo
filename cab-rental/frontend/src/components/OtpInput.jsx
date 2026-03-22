import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const OtpInput = ({ length = 6, onComplete, disabled = false }) => {
  const [values, setValues] = useState(Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    const code = newValues.join('');
    if (code.length === length && !newValues.includes('')) {
      onComplete?.(code);
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newValues = [...values];
      newValues[index - 1] = '';
      setValues(newValues);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newValues = [...values];
    for (let i = 0; i < pastedData.length; i++) {
      newValues[i] = pastedData[i];
    }
    setValues(newValues);

    // Focus the next empty input or the last one
    const nextEmpty = newValues.findIndex(v => !v);
    if (nextEmpty !== -1) {
      inputRefs.current[nextEmpty]?.focus();
    } else {
      inputRefs.current[length - 1]?.focus();
      onComplete?.(newValues.join(''));
    }
  };

  const reset = () => {
    setValues(Array(length).fill(''));
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="flex justify-center gap-2 sm:gap-3" onPaste={handlePaste}>
      {values.map((value, index) => (
        <motion.input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value}
          disabled={disabled}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            borderColor: value
              ? 'rgba(249, 115, 22, 0.6)'
              : 'rgba(255, 255, 255, 0.1)',
            boxShadow: value
              ? '0 0 20px rgba(249, 115, 22, 0.15)'
              : 'none'
          }}
          transition={{ delay: index * 0.05, duration: 0.2 }}
          className={`
            w-11 h-14 sm:w-13 sm:h-16
            text-center text-2xl font-bold
            bg-surface-2/50 border-2 rounded-xl
            text-white caret-primary
            outline-none transition-all duration-200
            focus:border-primary/60 focus:shadow-[0_0_24px_rgba(249,115,22,0.2)]
            disabled:opacity-40 disabled:cursor-not-allowed
            placeholder:text-white/10
          `}
          style={{ borderColor: value ? 'rgba(249,115,22,0.5)' : 'rgba(255,255,255,0.08)' }}
        />
      ))}
    </div>
  );
};

export default OtpInput;

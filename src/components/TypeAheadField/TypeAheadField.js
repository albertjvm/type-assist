import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './TypeAheadField.scss';

const delay = .5; // seconds

export const TypeAheadField = () => {
    const inputRef = useRef(null);
    const timer = useRef(null);
    const currentHint = useRef(0);
    const [ focus, setFocus ] = useState(false);
    const [ value, setValue ] = useState('');
    const [ subject, setSubject ] = useState('');
    const [ hint, setHint ] = useState('');
    const [ hints, setHints ] = useState([]);

    const loadHints = useCallback(async () => {
        const result = await fetch(
            `https://type.albertjvm.ca/.netlify/functions/openai?prompt=${subject || 'Write a dream sequence'}.\n\n${value}`
        );
        const { data: { choices } } = await result.json();
        return (choices.map(c => c.text.trim()));
    }, [subject, value]);

    const setInnerValue = (v) => {
        inputRef.current.innerText = v;
    };

    const hintTimer = useCallback(async () => {
        // setHint('');
        clearTimeout(timer.current);
        timer.current = setTimeout(async () => {
            // setHint(hints[currentHint.current]);
            const newHints = await loadHints();
            setHints(newHints);
            currentHint.current = 0;
            setHint(newHints[0])
        }, delay * 1000);
    }, [loadHints]);

    const setCursorPosition = (n) => {
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(inputRef.current.childNodes[0], n);
        range.collapse(true);
        sel.removeAllRanges()
        sel.addRange(range);
    };

    const handleInnerFocus = () => {
        setFocus(true);
        if (value.length) {
            setCursorPosition(value.length);
        }
    };
    const handleInnerBlur = () => {
        setFocus(false);
    };
    const handleInnerInput = (e) => {
        setValue(e.target.innerText)
    };
    const handleInnerKeyDown = (e) => {
        let newValue = '';

        if (e.key === 'Tab') {
            e.preventDefault();
            newValue = `${value.trim()} ${hint.trim()}`;
            setInnerValue(newValue);
            setValue(newValue);
            setHint('');
            setCursorPosition(newValue.length);
        } else if (e.key === 'ArrowRight') {
            if (window.getSelection().baseOffset === value.length) {
                newValue = `${value.trim()} ${hint.split(' ')[0].trim()}`;
                setInnerValue(newValue);
                setValue(newValue);
                setHint(hint.split(' ').slice(1).join(' ').trim());
                setCursorPosition(newValue.length);
            }
        } else if (e.key === 'ArrowDown') {
            if (hint && window.getSelection().baseOffset === value.length) {
                currentHint.current = (currentHint.current + 1) % hints.length;
                setHint(hints[currentHint.current]);
            }
        } else if (window.getSelection().baseOffset === value.length) {
            hintTimer();
        }
    };

    return (
        <div className="TypeAheadField--Wrapper">
            <input 
                type="text"
                className="Subject"
                placeholder='Write a dream sequence'
                value={subject}
                onChange={e => setSubject(e.target.value)}
            />
            <div
                className={`${'TypeAheadField'} ${focus ? 'focus' : ''}`}
                onClick={() => {
                    inputRef.current.focus();
                }}
            >
                <span
                    ref={inputRef}
                    contentEditable
                    className="editable"
                    onClick={e => false}
                    onFocus={handleInnerFocus}
                    onBlur={handleInnerBlur}
                    onInput={handleInnerInput}
                    onKeyDown={handleInnerKeyDown}
                />
                &nbsp;
                <span className="hint">{hint}</span>
            </div>
            { hint &&
                <div className='info'>
                    <span className="key">TAB</span> or <span className="key">→</span> to use suggestion,&nbsp;
                    <span className="key">↓</span> for new suggestion.
                </div>
            }
        </div>
    );
};

export default TypeAheadField;

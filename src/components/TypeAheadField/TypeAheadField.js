import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './TypeAheadField.scss';

const delay = 3; // seconds

export const TypeAheadField = () => {
    const hints = useMemo(() => [
        'lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        'ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
        'duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
        'excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
    ], []);

    const inputRef = useRef(null);
    const timer = useRef(null);
    const currentHint = useRef(0);
    const [ focus, setFocus ] = useState(false);
    const [ value, setValue ] = useState('');
    const [ hint, setHint ] = useState('');

    const setInnerValue = (v) => {
        inputRef.current.innerText = v;
    };

    const hintTimer = useCallback(() => {
        setHint('');
        clearTimeout(timer.current);
        timer.current = setTimeout(() => {
            setHint(hints[currentHint.current]);
        }, delay * 1000);
    }, [hints]);

    useEffect(() => {
        if (focus) {
            hintTimer();
        } else {
            setHint('');
        }
    }, [focus, hintTimer]);

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

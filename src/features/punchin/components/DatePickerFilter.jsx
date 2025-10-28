import React, { useState, useEffect, useRef } from 'react'
import DatePicker from 'react-multi-date-picker'
import transition from "react-element-popper/animations/transition"

const DatePickerFilter = ({ value, setCalendarDates }) => {
    const [tempDates, setTempDates] = useState(value)
    const datePickerRef = useRef()

    // Sync tempDates when value changes from parent
    useEffect(() => {
        setTempDates(value)
    }, [value])

    // Normalize dates to ensure start <= end
    const normalizeDates = (dates) => {
        const formattedDates = dates.map(date => date?.format?.("YYYY-MM-DD") || date)
        return formattedDates.sort((a, b) => new Date(a) - new Date(b))
    }

    const handleApply = () => {
        if (tempDates && tempDates.length === 2) {
            const sortedDates = normalizeDates(tempDates)
            setCalendarDates(sortedDates)
        } else if (tempDates && tempDates.length == 1) {
            tempDates[1] = tempDates[0]
            const sortedDates = normalizeDates(tempDates)
            setCalendarDates(sortedDates)
        }
        datePickerRef.current?.closeCalendar()
    }

    const handleReset = () => {
        const today = new Date()
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        const resetDates = [
            weekAgo.toISOString().split('T')[0],
            today.toISOString().split('T')[0]
        ]
        setTempDates(resetDates)
        setCalendarDates(resetDates)
        datePickerRef.current?.closeCalendar()
    }

    return (
        <div>
            <DatePicker
                ref={datePickerRef}
                range
                animations={[transition()]}
                value={tempDates}
                onChange={setTempDates}
                format="YYYY-MM-DD"
                render={(value, openCalendar) => {
                    return (
                        <button onClick={openCalendar} style={{
                            padding: '6px 12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: 'white',
                            cursor: 'pointer'
                        }}>
                            {value || 'Select Date Range'}
                        </button>
                    )
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px',
                    borderTop: '1px solid #ddd'
                }}>
                    <button
                        onClick={handleReset}
                        className="dp_buttons"
                        style={{
                            padding: '6px 16px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            background: '#f5f5f5',
                            cursor: 'pointer'
                        }}
                    >
                        Reset
                    </button>
                    <button
                        onClick={handleApply}
                        className="dp_buttons"
                        style={{
                            padding: '6px 16px',
                            border: 'none',
                            borderRadius: '4px',
                            background: '#007bff',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        Apply
                    </button>
                </div>
            </DatePicker>
        </div>
    )
}

export default DatePickerFilter

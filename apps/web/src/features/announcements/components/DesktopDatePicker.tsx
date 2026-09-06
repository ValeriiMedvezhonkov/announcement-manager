import { useCallback, useRef } from 'react';
import DatePicker from 'react-datepicker';

import { useOutsidePointerDown } from '../../../shared/lib/useOutsidePointerDown.ts';
import { formatDateInput, parsePublicationDate } from '../utils/dates.ts';
import shared from './date-field-shared.module.css';
import styles from './DesktopDatePicker.module.css';

import type { PublicationDateFieldProps } from './PublicationDateField.tsx';

/**
 * Desktop variant: calendar + time dropdown attached to the input.
 *
 * react-datepicker's own outside-click detection is unreliable when the
 * calendar renders in a portal, so a document-level listener closes it on
 * any press outside the field and the calendar.
 */
export function DesktopDatePicker(props: PublicationDateFieldProps) {
  const pickerRef = useRef<DatePicker>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useOutsidePointerDown(
    true,
    useCallback((target: EventTarget | null) => {
      const insideField = target instanceof Node && (wrapperRef.current?.contains(target) ?? false);
      const insideCalendar =
        target instanceof Element && target.closest('#datepicker-portal') !== null;
      return insideField || insideCalendar;
    }, []),
    useCallback(() => {
      if (pickerRef.current?.isCalendarOpen()) {
        pickerRef.current.setOpen(false);
      }
    }, []),
  );

  return (
    <div
      ref={wrapperRef}
      className={`${styles.wrapper} ${props.isInvalid ? shared.pickerInvalid : shared.picker}`}
    >
      <DatePicker
        ref={pickerRef}
        id={props.id}
        selected={parsePublicationDate(props.value)}
        onChange={(date: Date | null) => {
          props.onChange(date === null ? '' : formatDateInput(date));
        }}
        onBlur={props.onBlur}
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="MM/dd/yyyy HH:mm"
        placeholderText="MM/DD/YYYY HH:MM"
        portalId="datepicker-portal"
        popperPlacement="bottom-start"
        showPopperArrow={false}
        calendarClassName={shared.calendar}
        ariaInvalid={props.isInvalid ? 'true' : 'false'}
        ariaDescribedBy={props.describedBy}
        autoComplete="off"
      />
    </div>
  );
}

import { useState } from 'react';
import DatePicker from 'react-datepicker';

import { BottomSheet } from '../../../shared/ui/sheet/BottomSheet.tsx';
import { formatDateInput, parsePublicationDate } from '../utils/dates.ts';
import shared from './date-field-shared.module.css';
import styles from './MobileDateSheet.module.css';

import type { PublicationDateFieldProps } from './PublicationDateField.tsx';

/**
 * Mobile variant: a read-only field that opens the shared bottom sheet with
 * an inline calendar. Picking a time completes the choice and closes it.
 */
export function MobileDateSheet(props: PublicationDateFieldProps) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const closeSheet = (): void => {
    setSheetOpen(false);
    props.onBlur();
  };

  return (
    <div className={props.isInvalid ? shared.pickerInvalid : shared.picker}>
      <input
        id={props.id}
        type="text"
        readOnly
        value={props.value}
        placeholder="MM/DD/YYYY HH:MM"
        aria-invalid={props.isInvalid}
        aria-describedby={props.describedBy}
        aria-haspopup="dialog"
        onClick={() => {
          setSheetOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            setSheetOpen(true);
          }
        }}
      />
      <BottomSheet
        open={sheetOpen}
        aria-label="Pick publication date and time"
        onClose={closeSheet}
      >
        <div className={styles.sheetCalendar}>
          <DatePicker
            selected={parsePublicationDate(props.value)}
            onChange={(
              date: Date | null,
              event?: React.MouseEvent<HTMLElement> | React.KeyboardEvent<HTMLElement>,
            ) => {
              props.onChange(date === null ? '' : formatDateInput(date));
              // A time-slot pick completes the choice; a day pick keeps the
              // sheet open for the time selection.
              const target = event?.target;
              if (
                target instanceof Element &&
                target.closest('.react-datepicker__time-list-item') !== null
              ) {
                closeSheet();
              }
            }}
            inline
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            timeCaption="Time"
            calendarClassName={shared.calendar}
          />
        </div>
      </BottomSheet>
    </div>
  );
}

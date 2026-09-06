import { useIsMobile } from '../../../shared/lib/useMediaQuery.ts';
import { DesktopDatePicker } from './DesktopDatePicker.tsx';
import { MobileDateSheet } from './MobileDateSheet.tsx';
import 'react-datepicker/dist/react-datepicker.css';

export interface PublicationDateFieldProps {
  id: string;
  /** Form value in the specified MM/DD/YYYY HH:mm format. */
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  isInvalid: boolean;
  describedBy?: string | undefined;
}

/**
 * Calendar + time selection for the publication date. Desktop gets a dropdown
 * attached to the input; mobile gets the shared bottom sheet with an inline
 * calendar. The form value stays a string in the specified format either way.
 */
export function PublicationDateField(props: PublicationDateFieldProps) {
  const isMobile = useIsMobile();
  return isMobile ? <MobileDateSheet {...props} /> : <DesktopDatePicker {...props} />;
}

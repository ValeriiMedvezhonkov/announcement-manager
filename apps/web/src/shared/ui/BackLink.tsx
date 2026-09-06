import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';

import styles from './BackLink.module.css';

interface BackLinkProps {
  to: string;
  children: string;
}

/** Muted "go back" navigation link shown above page/form titles. */
export function BackLink(props: BackLinkProps) {
  return (
    <Link to={props.to} className={styles.link}>
      <ArrowLeft size={15} aria-hidden />
      {props.children}
    </Link>
  );
}

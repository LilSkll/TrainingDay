/**
 * Заголовок страницы с подзаголовком и опциональным действием справа.
 *  Повторяющийся паттерн во всех экранах — вынесли в компонент.
 */
import { Box, Button, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeader({ title, subtitle, action }: Props) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ sm: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: 3 }}
    >
      <Box>
        <Typography variant="h4" component="h1" fontWeight={800}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Stack>
  );
}

/** Хелпер, чтобы не таскать импорт Button везде. */
export function HeaderButton(props: {
  label: string;
  onClick?: () => void;
  startIcon?: ReactNode;
  variant?: 'text' | 'outlined' | 'contained';
  disabled?: boolean;
}) {
  return (
    <Button
      variant={props.variant ?? 'contained'}
      startIcon={props.startIcon}
      onClick={props.onClick}
      disabled={props.disabled}
    >
      {props.label}
    </Button>
  );
}

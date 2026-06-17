/**
 * Выбор одного значения из набора — в виде горизонтального ряда
 * «таблеток» (как в Apple Fitness / Notion).
 *  generic по типу значения T.
 */
import { Box, Chip } from '@mui/material';
import { Fragment } from 'react';

interface Props<T extends string | number> {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  /** Сколько колонок на узких экранах (по умолчанию авто). */
  columns?: number;
}

export default function PillSelect<T extends string | number>({
  value,
  options,
  onChange,
  columns,
}: Props<T>) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: columns
          ? `repeat(${columns}, 1fr)`
          : { xs: 'repeat(2, 1fr)', sm: 'repeat(auto-fit, minmax(140px, 1fr))' },
        gap: 1,
      }}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Fragment key={String(opt.value)}>
            {/* Chip-Toggle через клик. ButtonBase был бы избыточен. */}
            <Chip
              label={opt.label}
              clickable
              color={selected ? 'primary' : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              onClick={() => onChange(opt.value)}
              sx={{
                justifyContent: 'flex-start',
                height: 48,
                fontSize: '0.95rem',
                fontWeight: selected ? 700 : 500,
                px: 1.5,
                '& .MuiChip-label': { px: 0 },
              }}
            />
          </Fragment>
        );
      })}
    </Box>
  );
}

/** Мультивыбор — для набора тегов (например, оборудование). */
export function MultiPillSelect<T extends string | number>({
  values,
  options,
  onChange,
  columns,
}: {
  values: T[];
  options: Array<{ value: T; label: string }>;
  onChange: (next: T[]) => void;
  columns?: number;
}) {
  const toggle = (v: T) => {
    if (values.includes(v)) onChange(values.filter((x) => x !== v));
    else onChange([...values, v]);
  };
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: columns
          ? `repeat(${columns}, 1fr)`
          : { xs: 'repeat(2, 1fr)', sm: 'repeat(auto-fit, minmax(140px, 1fr))' },
        gap: 1,
      }}
    >
      {options.map((opt) => {
        const selected = values.includes(opt.value);
        return (
          <Chip
            key={String(opt.value)}
            label={opt.label}
            clickable
            color={selected ? 'primary' : 'default'}
            variant={selected ? 'filled' : 'outlined'}
            onClick={() => toggle(opt.value)}
            sx={{
              justifyContent: 'flex-start',
              height: 48,
              fontSize: '0.95rem',
              fontWeight: selected ? 700 : 500,
              px: 1.5,
              '& .MuiChip-label': { px: 0 },
            }}
          />
        );
      })}
    </Box>
  );
}

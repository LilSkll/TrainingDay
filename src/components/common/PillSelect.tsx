/**
 * Выбор одного значения из набора — в виде ряда «таблеток»
 * (как в Apple Fitness / Notion). generic по типу значения T.
 *
 *  ВАЖНО по читаемости: текст в таблетках переносится на 2 строки,
 *  фиксированной высоты нет — длинные подписи вроде «Набор мышечной массы»
 *  больше не обрезаются многоточием.
 */
import { Box, Chip } from '@mui/material';

interface Props<T extends string | number> {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (v: T) => void;
  /** Сколько колонок (по умолчанию авто: 2 на мобильном, auto-fit на широких). */
  columns?: number;
}

/** Общие стили таблетки, чтобы не дублировать между Pill/MultiPill. */
const CHIP_SX = {
  justifyContent: 'flex-start',
  // height: 'auto' + minHeight вместо фиксированных 48px → текст переносится.
  height: 'auto',
  minHeight: 48,
  py: 1.25,
  px: 1.5,
  borderRadius: 3,
  fontSize: '0.95rem',
  lineHeight: 1.25,
  fontWeight: 700,
  // Разрешаем перенос текста внутри таблетки (вместо nowrap + truncation).
  '& .MuiChip-label': {
    px: 0,
    whiteSpace: 'normal',
    textOverflow: 'clip',
    overflow: 'visible',
    display: 'block',
    textAlign: 'center',
    width: '100%',
  },
} as const;

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
          <Chip
            key={String(opt.value)}
            label={opt.label}
            clickable
            color={selected ? 'primary' : 'default'}
            variant={selected ? 'filled' : 'outlined'}
            onClick={() => onChange(opt.value)}
            sx={{
              ...CHIP_SX,
              // Невыбранные — чуть менее жирные.
              fontWeight: selected ? 700 : 500,
            }}
          />
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
              ...CHIP_SX,
              fontWeight: selected ? 700 : 500,
            }}
          />
        );
      })}
    </Box>
  );
}

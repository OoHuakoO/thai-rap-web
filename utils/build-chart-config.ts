import type { ChartConfig } from '@/components/ui/chart'

export function buildChartConfig<T>(
  items: T[],
  getKey: (item: T) => string,
  getLabel: (item: T) => string,
  getColor: (item: T) => string | undefined,
  defaultColors: readonly string[]
): ChartConfig {
  return items.reduce<ChartConfig>((acc, item, i) => {
    acc[getKey(item)] = {
      label: getLabel(item),
      color: getColor(item) ?? defaultColors[i % defaultColors.length],
    }
    return acc
  }, {})
}

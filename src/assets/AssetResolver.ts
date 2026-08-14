/** 素材解析：custom → default → fallback（空字符串表示使用 Canvas 占位）。 */
import { ASSETS, type AssetKind } from '../config/assets';
import { CUSTOM_ASSETS } from '../config/customAssets';

export class AssetResolver {
  /** 解析某类素材某 key 的最终 URL；找不到返回空字符串（渲染层用占位图）。 */
  resolve(kind: AssetKind, key: string): string {
    const custom = CUSTOM_ASSETS[kind]?.[key];
    if (custom) return custom;
    const defs = ASSETS[kind] as Record<string, string> | undefined;
    return defs?.[key] ?? '';
  }
}

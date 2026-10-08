import {
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseStrikethroughPlugin,
  BaseCodePlugin,
  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
} from "@platejs/basic-nodes"
import { BaseCodeBlockPlugin } from "@platejs/code-block"
import { BaseLinkPlugin } from "@platejs/link"
import {
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontColorPlugin,
  BaseFontBackgroundColorPlugin,
} from "@platejs/basic-styles"
import { BaseTablePlugin } from "@platejs/table"
import { BaseImagePlugin } from "@platejs/media"

export const plugins = [
  BaseH1Plugin,
  BaseH2Plugin,
  BaseH3Plugin,
  BaseBoldPlugin,
  BaseItalicPlugin,
  BaseUnderlinePlugin,
  BaseStrikethroughPlugin,
  BaseCodePlugin,
  BaseBlockquotePlugin,
  BaseHorizontalRulePlugin,
  BaseCodeBlockPlugin,
  BaseLinkPlugin,
  BaseFontFamilyPlugin,
  BaseFontSizePlugin,
  BaseFontColorPlugin,
  BaseFontBackgroundColorPlugin,
  BaseTablePlugin,
  BaseImagePlugin,
].map((plugin) => plugin.configure({}))

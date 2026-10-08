// Library-style declarations, modelled on Plate's SlatePlugin/configure.
// Under skipLibCheck this file is not checked, so these types are resolved on demand.
export type Shape<K extends string> = {
  key: K;
  prop0: { handler?: (key: K) => void };
  prop1: { handler?: (key: K) => void };
  prop2: { handler?: (key: K) => void };
  prop3: { handler?: (key: K) => void };
  prop4: { handler?: (key: K) => void };
  prop5: { handler?: (key: K) => void };
  prop6: { handler?: (key: K) => void };
  prop7: { handler?: (key: K) => void };
  prop8: { handler?: (key: K) => void };
  prop9: { handler?: (key: K) => void };
  prop10: { handler?: (key: K) => void };
  prop11: { handler?: (key: K) => void };
  prop12: { handler?: (key: K) => void };
  prop13: { handler?: (key: K) => void };
  prop14: { handler?: (key: K) => void };
  prop15: { handler?: (key: K) => void };
  prop16: { handler?: (key: K) => void };
  prop17: { handler?: (key: K) => void };
  prop18: { handler?: (key: K) => void };
  prop19: { handler?: (key: K) => void };
  prop20: { handler?: (key: K) => void };
  prop21: { handler?: (key: K) => void };
  prop22: { handler?: (key: K) => void };
  prop23: { handler?: (key: K) => void };
};
export type Config<K extends string> = Omit<Partial<Shape<K>>, "configure">;
export type Plugin<K extends string> = Shape<K> & {
  configure: (config: ((ctx: { key: K }) => Config<K>) | Config<K>) => Plugin<K>;
};
export declare function createPlugin<K extends string>(key: K): Plugin<K>;

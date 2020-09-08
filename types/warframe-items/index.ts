// To parse this data:
//
//   import { Convert } from "./file";
//
//   const warframes = Convert.toWarframes(json);
//
// These functions will throw an error if the JSON doesn't
// match the expected interface, even if the JSON is valid.

export interface Warframe {
  uniqueName:          string;
  name:                string;
  description:         string;
  health:              number;
  shield:              number;
  armor:               number;
  stamina:             number;
  power:               number;
  masteryReq:          number;
  sprintSpeed:         number;
  passiveDescription?: string;
  abilities:           Ability[];
  productCategory:     ProductCategory;
  buildPrice?:         number;
  buildTime?:          number;
  skipBuildTimePrice?: number;
  buildQuantity?:      number;
  consumeOnBuild?:     boolean;
  components?:         Component[];
  type:                WarframeType;
  imageName:           string;
  category:            Category;
  tradable:            boolean;
  patchlogs?:          Patchlog[];
  aura?:               Aura;
  conclave?:           boolean;
  color?:              number;
  introduced?:         string;
  polarities?:         Aura[];
  sex?:                Sex;
  sprint?:             number;
  wikiaThumbnail?:     string;
  wikiaUrl?:           string;
  releaseDate?:        string;
  vaultDate?:          string;
  estimatedVaultDate?: string;
  vaulted?:            boolean;
  exalted?:            string[];
  excludeFromCodex?:   boolean;
}

export interface Ability {
  name:        string;
  description: string;
}

export enum Aura {
  Madurai = "madurai",
  Naramon = "naramon",
  Umbra = "umbra",
  Vazarin = "vazarin",
}

export enum Category {
  Warframes = "Warframes",
}

export interface Component {
  uniqueName:         string;
  name:               string;
  description:        string;
  itemCount:          number;
  imageName:          string;
  tradable:           boolean;
  drops?:             Drop[];
  primeSellingPrice?: number;
  ducats?:            number;
}

export interface Drop {
  location:  string;
  type:      DropType;
  rarity:    Rarity;
  chance:    number;
  rotation?: Rotation;
}

export enum Rarity {
  Common = "Common",
  Legendary = "Legendary",
  Rare = "Rare",
  Uncommon = "Uncommon",
}

export enum Rotation {
  A = "A",
  Annihilation = "Annihilation",
  B = "B",
  C = "C",
  Capture = "Capture",
  Extra = "(Extra)",
  Field = "Field",
  Rewards = "rewards",
}

export enum DropType {
  CetusBountyRewards = "Cetus Bounty Rewards",
  DeimosRewards = "Deimos Rewards",
  EnemyBlueprintTables = "Enemy Blueprint Tables",
  KeyRewards = "Key Rewards",
  MissionRewards = "Mission Rewards",
  Relics = "Relics",
  ResourceByAvatar = "Resource By Avatar",
  SolarisBountyRewards = "Solaris Bounty Rewards",
  SortieRewards = "Sortie Rewards",
  TransientRewards = "Transient Rewards",
}

export interface Patchlog {
  name:      string;
  date:      Date;
  url:       string;
  additions: string;
  changes:   string;
  fixes:     string;
  imgUrl?:   string;
}

export enum ProductCategory {
  MechSuits = "MechSuits",
  Suits = "Suits",
}

export enum Sex {
  Empty = "",
  Female = "Female",
  Male = "Male",
}

export enum WarframeType {
  Warframe = "Warframe",
}

// Converts JSON strings to/from your types
// and asserts the results of JSON.parse at runtime
export class Convert {
  public static toWarframes(json: string): Warframe[] {
      return cast(JSON.parse(json), a(r("Warframes")));
  }

  public static warframesToJson(value: Warframe[]): string {
      return JSON.stringify(uncast(value, a(r("Warframes"))), null, 2);
  }
}

function invalidValue(typ: any, val: any, key: any = ''): never {
  if (key) {
      throw Error(`Invalid value for key "${key}". Expected type ${JSON.stringify(typ)} but got ${JSON.stringify(val)}`);
  }
  throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`, );
}

function jsonToJSProps(typ: any): any {
  if (typ.jsonToJS === undefined) {
      const map: any = {};
      typ.props.forEach((p: any) => map[p.json] = { key: p.js, typ: p.typ });
      typ.jsonToJS = map;
  }
  return typ.jsonToJS;
}

function jsToJSONProps(typ: any): any {
  if (typ.jsToJSON === undefined) {
      const map: any = {};
      typ.props.forEach((p: any) => map[p.js] = { key: p.json, typ: p.typ });
      typ.jsToJSON = map;
  }
  return typ.jsToJSON;
}

function transform(val: any, typ: any, getProps: any, key: any = ''): any {
  function transformPrimitive(typ: string, val: any): any {
      if (typeof typ === typeof val) return val;
      return invalidValue(typ, val, key);
  }

  function transformUnion(typs: any[], val: any): any {
      // val must validate against one typ in typs
      const l = typs.length;
      for (let i = 0; i < l; i++) {
          const typ = typs[i];
          try {
              return transform(val, typ, getProps);
          } catch (_) {}
      }
      return invalidValue(typs, val);
  }

  function transformEnum(cases: string[], val: any): any {
      if (cases.indexOf(val) !== -1) return val;
      return invalidValue(cases, val);
  }

  function transformArray(typ: any, val: any): any {
      // val must be an array with no invalid elements
      if (!Array.isArray(val)) return invalidValue("array", val);
      return val.map(el => transform(el, typ, getProps));
  }

  function transformDate(val: any): any {
      if (val === null) {
          return null;
      }
      const d = new Date(val);
      if (isNaN(d.valueOf())) {
          return invalidValue("Date", val);
      }
      return d;
  }

  function transformObject(props: { [k: string]: any }, additional: any, val: any): any {
      if (val === null || typeof val !== "object" || Array.isArray(val)) {
          return invalidValue("object", val);
      }
      const result: any = {};
      Object.getOwnPropertyNames(props).forEach(key => {
          const prop = props[key];
          const v = Object.prototype.hasOwnProperty.call(val, key) ? val[key] : undefined;
          result[prop.key] = transform(v, prop.typ, getProps, prop.key);
      });
      Object.getOwnPropertyNames(val).forEach(key => {
          if (!Object.prototype.hasOwnProperty.call(props, key)) {
              result[key] = transform(val[key], additional, getProps, key);
          }
      });
      return result;
  }

  if (typ === "any") return val;
  if (typ === null) {
      if (val === null) return val;
      return invalidValue(typ, val);
  }
  if (typ === false) return invalidValue(typ, val);
  while (typeof typ === "object" && typ.ref !== undefined) {
      typ = typeMap[typ.ref];
  }
  if (Array.isArray(typ)) return transformEnum(typ, val);
  if (typeof typ === "object") {
      return typ.hasOwnProperty("unionMembers") ? transformUnion(typ.unionMembers, val)
          : typ.hasOwnProperty("arrayItems")    ? transformArray(typ.arrayItems, val)
          : typ.hasOwnProperty("props")         ? transformObject(getProps(typ), typ.additional, val)
          : invalidValue(typ, val);
  }
  // Numbers can be parsed by Date but shouldn't be.
  if (typ === Date && typeof val !== "number") return transformDate(val);
  return transformPrimitive(typ, val);
}

function cast<T>(val: any, typ: any): T {
  return transform(val, typ, jsonToJSProps);
}

function uncast<T>(val: T, typ: any): any {
  return transform(val, typ, jsToJSONProps);
}

function a(typ: any) {
  return { arrayItems: typ };
}

function u(...typs: any[]) {
  return { unionMembers: typs };
}

function o(props: any[], additional: any) {
  return { props, additional };
}

function m(additional: any) {
  return { props: [], additional };
}

function r(name: string) {
  return { ref: name };
}

const typeMap: any = {
  "Warframes": o([
      { json: "uniqueName", js: "uniqueName", typ: "" },
      { json: "name", js: "name", typ: "" },
      { json: "description", js: "description", typ: "" },
      { json: "health", js: "health", typ: 0 },
      { json: "shield", js: "shield", typ: 0 },
      { json: "armor", js: "armor", typ: 0 },
      { json: "stamina", js: "stamina", typ: 0 },
      { json: "power", js: "power", typ: 0 },
      { json: "masteryReq", js: "masteryReq", typ: 0 },
      { json: "sprintSpeed", js: "sprintSpeed", typ: 3.14 },
      { json: "passiveDescription", js: "passiveDescription", typ: u(undefined, "") },
      { json: "abilities", js: "abilities", typ: a(r("Ability")) },
      { json: "productCategory", js: "productCategory", typ: r("ProductCategory") },
      { json: "buildPrice", js: "buildPrice", typ: u(undefined, 0) },
      { json: "buildTime", js: "buildTime", typ: u(undefined, 0) },
      { json: "skipBuildTimePrice", js: "skipBuildTimePrice", typ: u(undefined, 0) },
      { json: "buildQuantity", js: "buildQuantity", typ: u(undefined, 0) },
      { json: "consumeOnBuild", js: "consumeOnBuild", typ: u(undefined, true) },
      { json: "components", js: "components", typ: u(undefined, a(r("Component"))) },
      { json: "type", js: "type", typ: r("WarframeType") },
      { json: "imageName", js: "imageName", typ: "" },
      { json: "category", js: "category", typ: r("Category") },
      { json: "tradable", js: "tradable", typ: true },
      { json: "patchlogs", js: "patchlogs", typ: u(undefined, a(r("Patchlog"))) },
      { json: "aura", js: "aura", typ: u(undefined, r("Aura")) },
      { json: "conclave", js: "conclave", typ: u(undefined, true) },
      { json: "color", js: "color", typ: u(undefined, 0) },
      { json: "introduced", js: "introduced", typ: u(undefined, "") },
      { json: "polarities", js: "polarities", typ: u(undefined, a(r("Aura"))) },
      { json: "sex", js: "sex", typ: u(undefined, r("Sex")) },
      { json: "sprint", js: "sprint", typ: u(undefined, 3.14) },
      { json: "wikiaThumbnail", js: "wikiaThumbnail", typ: u(undefined, "") },
      { json: "wikiaUrl", js: "wikiaUrl", typ: u(undefined, "") },
      { json: "releaseDate", js: "releaseDate", typ: u(undefined, "") },
      { json: "vaultDate", js: "vaultDate", typ: u(undefined, "") },
      { json: "estimatedVaultDate", js: "estimatedVaultDate", typ: u(undefined, "") },
      { json: "vaulted", js: "vaulted", typ: u(undefined, true) },
      { json: "exalted", js: "exalted", typ: u(undefined, a("")) },
      { json: "excludeFromCodex", js: "excludeFromCodex", typ: u(undefined, true) },
  ], false),
  "Ability": o([
      { json: "name", js: "name", typ: "" },
      { json: "description", js: "description", typ: "" },
  ], false),
  "Component": o([
      { json: "uniqueName", js: "uniqueName", typ: "" },
      { json: "name", js: "name", typ: "" },
      { json: "description", js: "description", typ: "" },
      { json: "itemCount", js: "itemCount", typ: 0 },
      { json: "imageName", js: "imageName", typ: "" },
      { json: "tradable", js: "tradable", typ: true },
      { json: "drops", js: "drops", typ: u(undefined, a(r("Drop"))) },
      { json: "primeSellingPrice", js: "primeSellingPrice", typ: u(undefined, 0) },
      { json: "ducats", js: "ducats", typ: u(undefined, 0) },
  ], false),
  "Drop": o([
      { json: "location", js: "location", typ: "" },
      { json: "type", js: "type", typ: r("DropType") },
      { json: "rarity", js: "rarity", typ: r("Rarity") },
      { json: "chance", js: "chance", typ: 3.14 },
      { json: "rotation", js: "rotation", typ: u(undefined, r("Rotation")) },
  ], false),
  "Patchlog": o([
      { json: "name", js: "name", typ: "" },
      { json: "date", js: "date", typ: Date },
      { json: "url", js: "url", typ: "" },
      { json: "additions", js: "additions", typ: "" },
      { json: "changes", js: "changes", typ: "" },
      { json: "fixes", js: "fixes", typ: "" },
      { json: "imgUrl", js: "imgUrl", typ: u(undefined, "") },
  ], false),
  "Aura": [
      "madurai",
      "naramon",
      "umbra",
      "vazarin",
  ],
  "Category": [
      "Warframes",
  ],
  "Rarity": [
      "Common",
      "Legendary",
      "Rare",
      "Uncommon",
  ],
  "Rotation": [
      "A",
      "Annihilation",
      "B",
      "C",
      "Capture",
      "(Extra)",
      "Field",
      "rewards",
  ],
  "DropType": [
      "Cetus Bounty Rewards",
      "Deimos Rewards",
      "Enemy Blueprint Tables",
      "Key Rewards",
      "Mission Rewards",
      "Relics",
      "Resource By Avatar",
      "Solaris Bounty Rewards",
      "Sortie Rewards",
      "Transient Rewards",
  ],
  "ProductCategory": [
      "MechSuits",
      "Suits",
  ],
  "Sex": [
      "",
      "Female",
      "Male",
  ],
  "WarframeType": [
      "Warframe",
  ],
};

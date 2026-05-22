// Minimal Foundry VTT global stubs. Expand as needed.

declare const Hooks: {
  once(event: string, fn: (...args: any[]) => void): void;
  on(event: string, fn: (...args: any[]) => void): number;
  off(event: string, id: number): void;
  call(event: string, ...args: any[]): boolean;
  callAll(event: string, ...args: any[]): boolean;
};

declare class Item {
  id: string;
  name: string;
  img: string;
  system: unknown;
  toObject(): object;
}

declare class EmbeddedCollection<T> {
  get(id: string): T | undefined;
  map<U>(fn: (item: T) => U): U[];
}

declare class Actor {
  id: string;
  name: string;
  img: string;
  system: unknown;
  items: EmbeddedCollection<Item>;
  sheet: { render(force?: boolean): void } | null;
  getFlag(scope: string, key: string): unknown;
  setFlag(scope: string, key: string, value: unknown): Promise<Actor>;
  unsetFlag(scope: string, key: string): Promise<Actor>;
  update(data: object): Promise<Actor | undefined>;
  createEmbeddedDocuments(type: "Item", data: object[]): Promise<Item[]>;
  deleteEmbeddedDocuments(type: "Item", ids: string[]): Promise<Item[]>;
  static create(data: { name: string; type: string; img?: string; flags?: Record<string, unknown> }): Promise<Actor | undefined>;
}

declare class User {
  isGM: boolean;
  name: string;
  character: Actor | null;
}

interface Game {
  user: User | null;
  settings: {
    register(module: string, key: string, data: object): void;
    get(module: string, key: string): unknown;
    set(module: string, key: string, value: unknown): Promise<unknown>;
  };
  i18n: {
    localize(key: string): string;
    format(key: string, data?: object): string;
  };
}

declare const game: Game;

declare const ui: {
  notifications: {
    info(msg: string, options?: object): void;
    warn(msg: string, options?: object): void;
    error(msg: string, options?: object): void;
  };
};

declare const CONFIG: {
  Actor: {
    dataModels: Record<string, unknown>;
  };
  [key: string]: unknown;
};

declare namespace foundry {
  namespace abstract {
    class TypeDataModel {
      static defineSchema(): Record<string, unknown>;
      prepareBaseData(): void;
      prepareDerivedData(): void;
    }
  }
  namespace data {
    namespace fields {
      class StringField {
        constructor(opts?: object);
      }
      class HTMLField {
        constructor(opts?: object);
      }
      class NumberField {
        constructor(opts?: object);
      }
      class BooleanField {
        constructor(opts?: object);
      }
    }
  }
  namespace applications {
    namespace api {
      class DialogV2 {
        constructor(config: {
          window?: { title?: string };
          content?: string;
          buttons?: Array<{
            action: string;
            label: string;
            icon?: string;
            default?: boolean;
            callback?: (event: Event, button: HTMLElement, dialog: HTMLElement) => void;
          }>;
        });
        render(force?: boolean): this;
      }
      function HandlebarsApplicationMixin<
        T extends abstract new (...args: unknown[]) => object
      >(base: T): T;
    }
    namespace sheets {
      abstract class ActorSheetV2 {
        static DEFAULT_OPTIONS: Record<string, unknown>;
        static PARTS: Record<string, { template: string }>;
        get actor(): Actor;
        get title(): string;
        render(options?: unknown): Promise<this>;
        close(options?: unknown): Promise<this>;
        _prepareContext(options: unknown): Promise<Record<string, unknown>>;
        _configureRenderOptions(options: Record<string, unknown>): void;
      }
    }
  }
}

interface DialogButton {
  icon?: string;
  label: string;
  callback?: (html: HTMLElement) => void;
}

declare class Dialog {
  constructor(data: {
    title: string;
    content: string;
    buttons: Record<string, DialogButton>;
    default: string;
  });
  render(force?: boolean): this;
}

declare class DocumentSheetConfig {
  static registerSheet(
    documentClass: typeof Actor,
    scope: string,
    sheetClass: unknown,
    options?: {
      types?: string[];
      makeDefault?: boolean;
      label?: string;
    }
  ): void;
}

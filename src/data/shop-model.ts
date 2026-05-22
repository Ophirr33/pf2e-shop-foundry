const { TypeDataModel } = foundry.abstract;
const { StringField, HTMLField } = foundry.data.fields;

export class ShopDataModel extends TypeDataModel {
  static override defineSchema() {
    return {
      description: new HTMLField({ required: false, initial: "" }),
      shopkeeperName: new StringField({ required: false, initial: "" }),
    };
  }
}

import { Adapter } from "firebase/adapter";
import { Model, LiveModel } from "firebase/model";
import { Serializer } from "firebase/serializer";

var expts = {
  Adapter: Adapter,
  Model: Model,
  LiveModel: LiveModel,
  Serializer: Serializer
}

export = expts;

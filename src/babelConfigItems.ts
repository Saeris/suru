import type { ConfigItem } from "@babel/core";
import type PresetEnv from "@babel/preset-env";
import type PresetReact from "@babel/preset-react";
import type PresetTypescript from "@babel/preset-typescript";
import type PluginClassProperties from "@babel/plugin-proposal-class-properties";
import type PluginTransformRuntime from "@babel/plugin-transform-runtime";
import type PluginExternalHelpers from "@babel/plugin-external-helpers";
import { babel } from "./dependencies";
import { importModule } from "./filesystem/npm";
import { BABEL_DEPENDENCIES } from "./heuristics/babel";
import { MODULELOCATION } from "./types/module";

export const loadBabelConfigItem = async <Options extends object>(
  name: string,
  options: Options = {} as Options,
  { local = true, type }: { local?: boolean; type?: "preset" | "plugin" } = {}
): Promise<ConfigItem> => {
  const { createConfigItem } = await babel();
  const { [MODULELOCATION]: filePath } = await importModule(name, local);
  return createConfigItem([filePath!, options], { type });
};

export const presetEnv = async (options?: PresetEnv.Options): Promise<ConfigItem> =>
  loadBabelConfigItem<PresetEnv.Options>(BABEL_DEPENDENCIES.PRESET_ENV, options, {
    type: `preset`
  });
export const presetReact = async (options?: PresetReact.Options): Promise<ConfigItem> =>
  loadBabelConfigItem<PresetReact.Options>(BABEL_DEPENDENCIES.PRESET_REACT, options, {
    type: `preset`
  });

export const presetTypescript = async (options?: PresetTypescript.Options): Promise<ConfigItem> =>
  loadBabelConfigItem<PresetTypescript.Options>(BABEL_DEPENDENCIES.PRESET_TYPESCRIPT, options, {
    type: `preset`
  });

export const pluginClassProperties = async (
  options?: PluginClassProperties.Options
): Promise<ConfigItem> =>
  loadBabelConfigItem<PluginClassProperties.Options>(
    BABEL_DEPENDENCIES.PLUGIN_CLASS_PROPERTIES,
    options,
    {
      type: `plugin`
    }
  );

export const pluginTransformRuntime = async (
  options?: PluginTransformRuntime.Options
): Promise<ConfigItem> =>
  loadBabelConfigItem<PluginTransformRuntime.Options>(
    BABEL_DEPENDENCIES.PLUGIN_TRANSFORM_RUNTIME,
    options,
    {
      type: `plugin`
    }
  );

export const pluginExternalHelpers = async (
  options?: PluginExternalHelpers.Options
): Promise<ConfigItem> =>
  loadBabelConfigItem<PluginExternalHelpers.Options>(
    BABEL_DEPENDENCIES.PLUGIN_EXTERNAL_HELPERS,
    options,
    {
      type: `plugin`
    }
  );

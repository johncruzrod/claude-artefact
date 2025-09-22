import * as React from "react";
import * as ReactDOMLegacy from "react-dom";
import * as ReactDOMClient from "react-dom/client";
import * as ReactRouterDom from "react-router-dom";
import * as ReactJsxRuntime from "react/jsx-runtime";
import * as ReactJsxDevRuntime from "react/jsx-dev-runtime";
import * as MaterialUI from "@mui/material";
import * as MaterialStyles from "@mui/material/styles";
import * as MaterialColors from "@mui/material/colors";
import * as MaterialSystem from "@mui/system";
import * as LucideIcons from "lucide-react";
import * as Recharts from "recharts";
import * as Lodash from "lodash";
import * as D3 from "d3";
// Three.js and MathJS will be loaded dynamically for components that need them
// import * as Three from "three";
// import * as MathJs from "mathjs";
import * as ReactHookForm from "react-hook-form";
import * as HookFormResolvers from "@hookform/resolvers";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import * as EmotionReact from "@emotion/react";
import emotionStyled from "@emotion/styled";
// Additional libraries to broaden compatibility
import axios from "axios";
import * as Zustand from "zustand";
import * as ReactQuery from "@tanstack/react-query";
import * as Redux from "redux";
import * as ReactRedux from "react-redux";
import * as Formik from "formik";
import * as Yup from "yup";
import * as StyledComponents from "styled-components";
import classnames from "classnames";
import * as FramerMotion from "framer-motion";
import * as ChakraUI from "@chakra-ui/react";
import * as AntDesign from "antd";
import * as ReactBootstrap from "react-bootstrap";
import * as Tone from "tone";
// Lucide React provides 5,295+ icons - that's plenty!
// Utility functions
import { cn } from "../lib/utils";

import * as shadcnAlert from "../components/ui/alert";
import * as shadcnAvatar from "../components/ui/avatar";
import * as shadcnBadge from "../components/ui/badge";
import * as shadcnButton from "../components/ui/button";
import * as shadcnCard from "../components/ui/card";
import * as shadcnCheckbox from "../components/ui/checkbox";
import * as shadcnDialog from "../components/ui/dialog";
import * as shadcnDropdownMenu from "../components/ui/dropdown-menu";
import * as shadcnForm from "../components/ui/form";
import * as shadcnInput from "../components/ui/input";
import * as shadcnLabel from "../components/ui/label";
import * as shadcnPopover from "../components/ui/popover";
import * as shadcnProgress from "../components/ui/progress";
import * as shadcnSelect from "../components/ui/select";
import * as shadcnSeparator from "../components/ui/separator";
import * as shadcnSlider from "../components/ui/slider";
import * as shadcnSwitch from "../components/ui/switch";
import * as shadcnTable from "../components/ui/table";
import * as shadcnTabs from "../components/ui/tabs";

export type ModuleRegistry = Record<string, unknown>;

export function createModuleRegistry(): ModuleRegistry {
  const registry: ModuleRegistry = {
    react: React,
    "react-dom": ReactDOMLegacy,
    "react-dom/client": ReactDOMClient,
    "react-router-dom": ReactRouterDom,
    "react/jsx-runtime": ReactJsxRuntime,
    "react/jsx-dev-runtime": ReactJsxDevRuntime,
    "@mui/material": MaterialUI,
    "@mui/material/styles": MaterialStyles,
    "@mui/material/colors": MaterialColors,
    "@mui/system": MaterialSystem,
    "@emotion/react": EmotionReact,
    "@emotion/styled": emotionStyled,
    axios,
    zustand: Zustand,
    "@tanstack/react-query": ReactQuery,
    redux: Redux,
    "react-redux": ReactRedux,
    formik: Formik,
    yup: Yup,
    "styled-components": StyledComponents,
    classnames,
    "lucide-react": LucideIcons,
    "framer-motion": FramerMotion,
    "@chakra-ui/react": ChakraUI,
    antd: AntDesign,
    "react-bootstrap": ReactBootstrap,
    tone: Tone,
    recharts: Recharts,
    lodash: Lodash,
    "lodash-es": Lodash,
    d3: D3,
    // three: Three,  // Loaded dynamically
    // mathjs: MathJs,  // Loaded dynamically
    "react-hook-form": ReactHookForm,
    "@hookform/resolvers": HookFormResolvers,
    "@hookform/resolvers/zod": { zodResolver },
    zod: z,
    z,
    clsx,
    "@/lib/utils": { cn },
    "@/components/ui/alert": shadcnAlert,
    "@/components/ui/avatar": shadcnAvatar,
    "@/components/ui/badge": shadcnBadge,
    "@/components/ui/button": shadcnButton,
    "@/components/ui/card": shadcnCard,
    "@/components/ui/checkbox": shadcnCheckbox,
    "@/components/ui/dialog": shadcnDialog,
    "@/components/ui/dropdown-menu": shadcnDropdownMenu,
    "@/components/ui/form": shadcnForm,
    "@/components/ui/input": shadcnInput,
    "@/components/ui/label": shadcnLabel,
    "@/components/ui/popover": shadcnPopover,
    "@/components/ui/progress": shadcnProgress,
    "@/components/ui/select": shadcnSelect,
    "@/components/ui/separator": shadcnSeparator,
    "@/components/ui/slider": shadcnSlider,
    "@/components/ui/switch": shadcnSwitch,
    "@/components/ui/table": shadcnTable,
    "@/components/ui/tabs": shadcnTabs,
  };

  return Object.freeze(registry);
}

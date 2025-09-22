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
import * as Three from "three";
import * as MathJs from "mathjs";
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
// React Icons popular packs
import * as ReactIcons from "react-icons";
import * as ReactIconsAi from "react-icons/ai";
import * as ReactIconsBi from "react-icons/bi";
import * as ReactIconsBs from "react-icons/bs";
import * as ReactIconsCi from "react-icons/ci";
import * as ReactIconsCg from "react-icons/cg";
import * as ReactIconsDi from "react-icons/di";
import * as ReactIconsFa from "react-icons/fa";
import * as ReactIconsFa6 from "react-icons/fa6";
import * as ReactIconsFi from "react-icons/fi";
import * as ReactIconsGi from "react-icons/gi";
import * as ReactIconsGo from "react-icons/go";
import * as ReactIconsGr from "react-icons/gr";
import * as ReactIconsHi from "react-icons/hi";
import * as ReactIconsHi2 from "react-icons/hi2";
import * as ReactIconsIm from "react-icons/im";
import * as ReactIconsIo from "react-icons/io";
import * as ReactIconsIo5 from "react-icons/io5";
import * as ReactIconsLia from "react-icons/lia";
import * as ReactIconsLu from "react-icons/lu";
import * as ReactIconsMd from "react-icons/md";
import * as ReactIconsPi from "react-icons/pi";
import * as ReactIconsRi from "react-icons/ri";
import * as ReactIconsRx from "react-icons/rx";
import * as ReactIconsSi from "react-icons/si";
import * as ReactIconsSl from "react-icons/sl";
import * as ReactIconsTb from "react-icons/tb";
import * as ReactIconsTfi from "react-icons/tfi";
import * as ReactIconsTi from "react-icons/ti";
import * as ReactIconsVsc from "react-icons/vsc";
import * as ReactIconsWi from "react-icons/wi";
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
    "react-icons": ReactIcons,
    "react-icons/ai": ReactIconsAi,
    "react-icons/bi": ReactIconsBi,
    "react-icons/bs": ReactIconsBs,
    "react-icons/ci": ReactIconsCi,
    "react-icons/cg": ReactIconsCg,
    "react-icons/di": ReactIconsDi,
    "react-icons/fa": ReactIconsFa,
    "react-icons/fa6": ReactIconsFa6,
    "react-icons/fi": ReactIconsFi,
    "react-icons/gi": ReactIconsGi,
    "react-icons/go": ReactIconsGo,
    "react-icons/gr": ReactIconsGr,
    "react-icons/hi": ReactIconsHi,
    "react-icons/hi2": ReactIconsHi2,
    "react-icons/im": ReactIconsIm,
    "react-icons/io": ReactIconsIo,
    "react-icons/io5": ReactIconsIo5,
    "react-icons/lia": ReactIconsLia,
    "react-icons/lu": ReactIconsLu,
    "react-icons/md": ReactIconsMd,
    "react-icons/pi": ReactIconsPi,
    "react-icons/ri": ReactIconsRi,
    "react-icons/rx": ReactIconsRx,
    "react-icons/si": ReactIconsSi,
    "react-icons/sl": ReactIconsSl,
    "react-icons/tb": ReactIconsTb,
    "react-icons/tfi": ReactIconsTfi,
    "react-icons/ti": ReactIconsTi,
    "react-icons/vsc": ReactIconsVsc,
    "react-icons/wi": ReactIconsWi,
    recharts: Recharts,
    lodash: Lodash,
    "lodash-es": Lodash,
    d3: D3,
    three: Three,
    mathjs: MathJs,
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

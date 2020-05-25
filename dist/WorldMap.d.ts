import React from "react";
interface IData {
    country: string;
    value: number;
}
interface IProps {
    data: IData[];
    title?: string;
    valuePrefix?: string;
    valueSuffix?: string;
    color?: string;
    tooltipBgColor?: string;
    tooltipTextColor?: string;
    size?: string;
    border?: boolean;
    borderColor?: string;
}
export declare const WorldMap: React.FC<IProps>;
export {};

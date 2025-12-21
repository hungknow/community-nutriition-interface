import { D3JsWeightForLength } from "./d3js-weight-for-length";
import { weightForLengthGirlBirthTo2Years } from "who-child-growth-standards";

export default {
  default: <D3JsWeightForLength data={weightForLengthGirlBirthTo2Years} xAxisLabel={"chiều cao (cm)"} yAxisLabel={"cân nặng (kg)"} />,
};
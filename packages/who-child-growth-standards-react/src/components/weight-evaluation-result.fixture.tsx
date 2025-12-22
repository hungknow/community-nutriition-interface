import { AtomProvider, createEcosystem, EcosystemProvider } from "@zedux/react";
import { WeightEvaluationResult } from "./weight-evaluation-result";
import { weightEvaluationRequestAtom } from "@/atoms/weight-evaluation-atom";
import { Gender } from "who-child-growth-standards";

const ecosystem = createEcosystem({
    id: 'root',
    onReady: ecosystem => {
        const weightEvaluationRequestAtomNode = ecosystem.getNode(weightEvaluationRequestAtom, [])
        weightEvaluationRequestAtomNode.set({
            weight: 10,
            length: 90,
            birthdate: new Date('2025-01-01'),
            gender: Gender.Female
        })
    },
})

const WeightEvaluationResultFixture = () => {
    return (
        <EcosystemProvider ecosystem={ecosystem}>
            <WeightEvaluationResult />
        </EcosystemProvider>
    )
}

export default {
    default: <WeightEvaluationResultFixture />
}

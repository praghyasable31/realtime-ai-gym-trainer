"""
Form evaluation and biomechanical rule checker.
"""
from typing import Dict, List, Tuple

class FormAnalyzer:
    """
    Evaluates form quality scores based on kinematic angle boundaries and deviation limits.
    """
    @staticmethod
    def evaluate_posture(angles: Dict[str, float], rules: Dict[str, Tuple[float, float]]) -> Tuple[int, List[str]]:
        """
        Takes calculated angles and a rule map:
        rules = { 'knee': (min_allowed, max_allowed), ... }
        Returns (score, list_of_violations)
        """
        violations = []
        deductions = 0

        for key, (min_val, max_val) in rules.items():
            if key in angles:
                val = angles[key]
                if val < min_val:
                    diff = min_val - val
                    deductions += min(20, int(diff * 0.8))
                    violations.append(f"{key} angle below target range ({val:.1f}° < {min_val}°)")
                elif val > max_val:
                    diff = val - max_val
                    deductions += min(20, int(diff * 0.8))
                    violations.append(f"{key} angle exceeded safe limit ({val:.1f}° > {max_val}°)")

        score = max(40, 100 - deductions)
        return score, violations

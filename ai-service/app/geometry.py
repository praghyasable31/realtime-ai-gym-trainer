"""
Mathematical and geometric utilities for joint angle calculation and body alignment analysis.
"""
from collections import deque
from typing import Dict, List, Tuple, Union
import numpy as np

def calculate_angle(
    a: Union[List[float], Tuple[float, ...], np.ndarray],
    b: Union[List[float], Tuple[float, ...], np.ndarray],
    c: Union[List[float], Tuple[float, ...], np.ndarray],
    use_3d: bool = False
) -> float:
    """
    Calculates the interior angle at joint 'b' formed by segments (b -> a) and (b -> c).
    
    Parameters:
        a: First outer point [x, y] or [x, y, z]
        b: Joint vertex point [x, y] or [x, y, z]
        c: Second outer point [x, y] or [x, y, z]
        use_3d: Whether to compute 3D Euclidean angle or 2D plane angle
        
    Returns:
        Angle in degrees [0.0, 180.0]
    """
    dim = 3 if use_3d and len(a) >= 3 and len(b) >= 3 and len(c) >= 3 else 2
    
    vec_ba = np.array(a[:dim], dtype=np.float64) - np.array(b[:dim], dtype=np.float64)
    vec_bc = np.array(c[:dim], dtype=np.float64) - np.array(b[:dim], dtype=np.float64)

    norm_ba = np.linalg.norm(vec_ba)
    norm_bc = np.linalg.norm(vec_bc)

    if norm_ba < 1e-6 or norm_bc < 1e-6:
        return 0.0

    # Dot product calculation
    cosine_angle = np.dot(vec_ba, vec_bc) / (norm_ba * norm_bc)
    
    # Clip to avoid float precision overflow outside [-1.0, 1.0]
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    
    angle_rad = np.arccos(cosine_angle)
    angle_deg = np.degrees(angle_rad)
    
    return float(angle_deg)


def calculate_vertical_angle(
    top_point: Union[List[float], Tuple[float, ...], np.ndarray],
    bottom_point: Union[List[float], Tuple[float, ...], np.ndarray]
) -> float:
    """
    Calculates the deviation of a segment (e.g. torso/spine) from the true vertical axis.
    A perfectly vertical spine has an angle of 0.0 degrees.
    """
    dx = float(top_point[0] - bottom_point[0])
    dy = float(top_point[1] - bottom_point[1])
    
    # In screen coordinates, y increases downward.
    # Vertical line has dx=0.
    angle_rad = np.arctan2(abs(dx), abs(dy) + 1e-6)
    return float(np.degrees(angle_rad))


class AngleSmoother:
    """
    Smooths noisy raw joint angles across consecutive video frames
    using an Exponential Moving Average (EMA) or sliding window deque.
    """
    def __init__(self, window_size: int = 5, alpha: float = 0.6):
        self.window_size = window_size
        self.alpha = alpha
        self.buffers: Dict[str, deque] = {}
        self.ema_values: Dict[str, float] = {}

    def smooth(self, key: str, raw_angle: float) -> float:
        if raw_angle is None or np.isnan(raw_angle):
            return 0.0
            
        if key not in self.ema_values:
            self.ema_values[key] = raw_angle
            self.buffers[key] = deque([raw_angle], maxlen=self.window_size)
            return round(raw_angle, 1)

        # Exponential moving average filter
        smoothed = (self.alpha * raw_angle) + ((1.0 - self.alpha) * self.ema_values[key])
        self.ema_values[key] = smoothed
        
        self.buffers[key].append(smoothed)
        return round(float(np.mean(self.buffers[key])), 1)

    def reset(self):
        self.buffers.clear()
        self.ema_values.clear()

import { RoadmapModule } from '../types';
import { PART_0 } from './roadmap/part0';
import { PART_1 } from './roadmap/part1';
import { PART_2 } from './roadmap/part2';
import { PART_3 } from './roadmap/part3';
import { PART_4 } from './roadmap/part4';
import { PART_5 } from './roadmap/part5';
import { PART_6 } from './roadmap/part6';
import { PART_7 } from './roadmap/part7';
import { PART_8 } from './roadmap/part8';

export const ROADMAP: RoadmapModule[] = [
  PART_0,
  PART_1,
  PART_2,
  PART_3,
  PART_4,
  PART_5,
  PART_6,
  PART_7,
  PART_8,
];

export const TOTAL_LESSONS = ROADMAP.reduce((sum, mod) => sum + mod.lessons.length, 0);

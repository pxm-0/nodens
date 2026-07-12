---
title: Oreo Cloud
subtitle: A personal infrastructure layer from vision to projects.
status: active
phase: Architecture bridge
year: 2026–
featured: true
summary: A self-hosted miniature cloud intended to turn project concepts into repeatable, observable deployments on owned hardware.
caveat: The system is a direction and an active build, not a finished cloud platform.
stack:
  - Linux
  - Docker
  - Reverse proxy
  - Observability
  - CI/CD
links: []
---

Oreo Cloud is the bridge between having an idea and having a running system.

The target is not to imitate every hyperscaler feature. It is to build a small, understandable deployment surface with enough of the useful primitives: containers, routing, secrets, storage, jobs, observability, and repeatable delivery.

The physical base is an ASUS TUF FX505DT running Ubuntu, with a Ryzen 7 3750H, 20 GB RAM, NVMe storage, and a GTX 1650 Mobile.

## Purpose

- make personal projects deployable by default
- learn cloud architecture through owned infrastructure
- retain control of the public surface
- reduce recurring deployment cost
- create a local bridge toward AWS patterns later

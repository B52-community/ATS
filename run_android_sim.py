#!/usr/bin/env python3
"""Launch an Android-x86 ISO in QEMU.

Example:
    python3 run_android_sim.py --iso ~/Downloads/android-x86_64.iso
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path


DEFAULT_RAM_MB = 2048
DEFAULT_CPUS = 2
DEFAULT_DISK_SIZE_GB = 16


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Run an Android ISO in a QEMU virtual machine."
    )
    parser.add_argument(
        "--iso",
        required=True,
        type=Path,
        help="Path to the Android ISO file.",
    )
    parser.add_argument(
        "--disk",
        type=Path,
        default=Path("android_vm.qcow2"),
        help="Path to the virtual disk image (qcow2). Default: ./android_vm.qcow2",
    )
    parser.add_argument(
        "--ram",
        type=int,
        default=DEFAULT_RAM_MB,
        help=f"RAM in MB. Default: {DEFAULT_RAM_MB}",
    )
    parser.add_argument(
        "--cpus",
        type=int,
        default=DEFAULT_CPUS,
        help=f"Number of virtual CPUs. Default: {DEFAULT_CPUS}",
    )
    parser.add_argument(
        "--disk-size",
        type=int,
        default=DEFAULT_DISK_SIZE_GB,
        help=f"Disk size in GB when creating a new disk image. Default: {DEFAULT_DISK_SIZE_GB}",
    )
    parser.add_argument(
        "--no-kvm",
        action="store_true",
        help="Disable KVM acceleration (useful if /dev/kvm is not available).",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print commands but do not execute.",
    )
    return parser.parse_args()


def ensure_binary(name: str) -> str:
    path = shutil.which(name)
    if not path:
        raise FileNotFoundError(f"Required binary '{name}' is not installed or not in PATH.")
    return path


def create_disk_if_missing(qemu_img: str, disk_path: Path, disk_size_gb: int, dry_run: bool) -> None:
    if disk_path.exists():
        return

    cmd = [qemu_img, "create", "-f", "qcow2", str(disk_path), f"{disk_size_gb}G"]
    print("Creating virtual disk:", " ".join(cmd))
    if dry_run:
        return
    subprocess.run(cmd, check=True)


def build_qemu_command(
    qemu_system: str,
    iso_path: Path,
    disk_path: Path,
    ram_mb: int,
    cpus: int,
    use_kvm: bool,
) -> list[str]:
    command = [
        qemu_system,
        "-m",
        str(ram_mb),
        "-smp",
        str(cpus),
        "-boot",
        "d",
        "-cdrom",
        str(iso_path),
        "-drive",
        f"file={disk_path},if=virtio,format=qcow2",
        "-device",
        "virtio-vga",
        "-device",
        "qemu-xhci",
        "-device",
        "usb-tablet",
        "-net",
        "nic",
        "-net",
        "user",
        "-display",
        "gtk",
    ]

    if use_kvm:
        command.extend(["-enable-kvm", "-cpu", "host"])

    return command


def main() -> int:
    args = parse_args()

    iso_path = args.iso.expanduser().resolve()
    disk_path = args.disk.expanduser().resolve()

    if not iso_path.exists() or not iso_path.is_file():
        print(f"ISO file not found: {iso_path}", file=sys.stderr)
        return 1

    if args.ram <= 0 or args.cpus <= 0 or args.disk_size <= 0:
        print("RAM, CPUs, and disk size must be positive integers.", file=sys.stderr)
        return 1

    try:
        qemu_system = ensure_binary("qemu-system-x86_64")
        qemu_img = ensure_binary("qemu-img")
    except FileNotFoundError as error:
        print(error, file=sys.stderr)
        return 1

    use_kvm = not args.no_kvm

    try:
        create_disk_if_missing(qemu_img, disk_path, args.disk_size, args.dry_run)
    except subprocess.CalledProcessError as error:
        print(f"Failed to create disk image: {error}", file=sys.stderr)
        return error.returncode or 1

    qemu_command = build_qemu_command(
        qemu_system=qemu_system,
        iso_path=iso_path,
        disk_path=disk_path,
        ram_mb=args.ram,
        cpus=args.cpus,
        use_kvm=use_kvm,
    )

    print("Launching Android simulator with command:")
    print(" ".join(qemu_command))

    if args.dry_run:
        return 0

    try:
        completed = subprocess.run(qemu_command, check=False)
    except KeyboardInterrupt:
        print("\nSimulator interrupted by user.")
        return 130

    return completed.returncode


if __name__ == "__main__":
    raise SystemExit(main())

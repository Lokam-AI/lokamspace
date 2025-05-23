from setuptools import setup, find_packages

setup(
    name="lokamspace",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "python-dotenv",
        "sqlalchemy",
        "livekit",
    ],
) 
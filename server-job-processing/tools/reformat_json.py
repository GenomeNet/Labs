import json
import argparse
import os
import logging

def setup_logging(verbose, silent):
    if silent:
        logging.basicConfig(level=logging.CRITICAL, format="%(message)s")
    else:
        log_level = logging.DEBUG if verbose else logging.INFO
        logging.basicConfig(level=log_level, format="%(message)s")

def read_json_file(input_path):
    """Reads a JSON file and returns its content."""
    try:
        with open(input_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        logging.error(f"File {input_path} not found.")
        exit(1)
    except json.JSONDecodeError:
        logging.error("Failed to decode JSON.")
        exit(1)

def validate_sequence(sequence):
    """Validates that the sequence only contains valid nucleotide characters."""
    valid_nucleotides = set("ATCGN")
    if not all(char in valid_nucleotides for char in sequence):
        logging.error("The sequence contains invalid nucleotide characters.")
        exit(1)

def write_fasta_file(output_path, header, sequence):
    """Writes the header and sequence to a FASTA-formatted file."""
    try:
        with open(output_path, 'w') as f:
            f.write(header + '\n')
            for i in range(0, len(sequence), 80):
                f.write(sequence[i:i+80] + '\n')
    except Exception as e:
        logging.error(f"Failed to write to output file. {e}")
        exit(1)

def main():
    """Main function to convert JSON to FASTA format."""
    parser = argparse.ArgumentParser(description='Convert a JSON file to FASTA format.')
    parser.add_argument('--input', required=True, type=str, help='Path to the input JSON file.')
    parser.add_argument('--output', required=True, type=str, help='Path to the output FASTA file.')
    parser.add_argument('--verbose', action='store_true', help='Enable verbose logging.')
    parser.add_argument('--silent', action='store_true', help='Enable silent mode (no logging to console).')

    args = parser.parse_args()

    setup_logging(args.verbose, args.silent)

    if not os.path.exists(args.input):
        logging.error(f"Input file {args.input} does not exist.")
        exit(1)

    logging.info(f"Reading input file {args.input}...")
    json_data = read_json_file(args.input)
    header = json_data[0]
    sequence = ''.join(json_data[1:])

    logging.info("Validating sequence...")
    validate_sequence(sequence)

    logging.info(f"Writing output file {args.output}...")
    write_fasta_file(args.output, header, sequence)

    logging.info(f"Conversion complete. Output saved to {args.output}")

if __name__ == '__main__':
    main()

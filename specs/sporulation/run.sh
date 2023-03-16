echo "Formatting input"
mv $1 input.fasta
awk '{gsub(/",/,"\n")}1' input.fasta |  awk '{gsub(/ "/,"")}1' | sed 's/.$//; s/^.//' > input2.fasta
echo "Running model"
cat input2.fasta | sudo docker run --rm -i genomenet/morphology sporulation_server.r > output.csv
echo "Finished"

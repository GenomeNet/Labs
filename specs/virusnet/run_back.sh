mv $1 input.fasta
awk '{gsub(/",/,"\n")}1' input.fasta |  awk '{gsub(/ "/,"")}1' | sed 's/.$//; s/^.//' > input2.fasta
cat input2.fasta | sudo docker run --rm -i genomenet/virusnet:alpha genus_server.r > output.csv
